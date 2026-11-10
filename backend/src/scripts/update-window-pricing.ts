/**
 * One-off migration: per-sq.ft window pricing and new size limits.
 *
 *   Sliding window   70mm  width ≤ 6 ft and height ≤ 4 ft   LKR 3,000 / sq.ft
 *                    80mm  width ≤ 8 ft and height ≤ 10 ft  LKR 4,500 / sq.ft
 *                    100mm anything larger                  LKR 7,000 / sq.ft  (new SW100 profiles)
 *   Swing window     41mm  width ≤ 4 ft, any height         LKR 3,000 / sq.ft
 *                    60mm  anything larger                  LKR 4,500 / sq.ft
 *
 * Existing size bands are found by the profile series their cut list uses
 * (SW70, SW80, CW41, CW60) and only their size limits and rate are changed —
 * cut-list formulas and labour/glass/hardware rates you edited are kept.
 * The 100mm sliding band and the four SW100 profiles are added if missing.
 * The old bands are copied to the `migration_backups` collection first.
 *
 * Dry run by default. Pass --apply to write:
 *   npx ts-node src/scripts/update-window-pricing.ts
 *   npx ts-node src/scripts/update-window-pricing.ts --apply
 *
 * Uses MONGODB_URI from the environment, else backend/.env.
 * Orders already placed keep the price they were quoted.
 */
import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import { join } from 'path';
import { SAMPLE_PROFILES, SAMPLE_TEMPLATES } from '../materials/sample-data';

dotenv.config({ path: join(__dirname, '../../.env') });

const MIGRATION = '2026-11-window-per-sqft-pricing';

type Band = Record<string, any> & { name: string; lines?: { profileCode: string }[] };

interface BandRule {
  series: string;
  limits: { maxWidthFt?: number; maxHeightFt?: number };
  pricePerSqFt: number;
}

const RULES: Record<'sliding' | 'swing', BandRule[]> = {
  sliding: [
    { series: 'SW70', limits: { maxWidthFt: 6, maxHeightFt: 4 }, pricePerSqFt: 3000 },
    { series: 'SW80', limits: { maxWidthFt: 8, maxHeightFt: 10 }, pricePerSqFt: 4500 },
    { series: 'SW100', limits: {}, pricePerSqFt: 7000 },
  ],
  swing: [
    { series: 'CW41', limits: { maxWidthFt: 4 }, pricePerSqFt: 3000 },
    { series: 'CW60', limits: {}, pricePerSqFt: 4500 },
  ],
};

const LIMIT_KEYS = ['maxWidthFt', 'maxHeightFt', 'maxAreaSqFt', 'maxPanelWidthFt'] as const;

/** The profile series a band is cut from, e.g. "SW70" — null if mixed or empty. */
function bandSeries(band: Band): string | null {
  const prefixes = new Set(
    (band.lines ?? []).map((l) => l.profileCode?.toUpperCase().split('-')[0]).filter((p) => p && p !== 'GB'),
  );
  return prefixes.size === 1 ? [...prefixes][0] : null;
}

/** JSON with sorted keys, so key order doesn't count as a change. */
const canonical = (value: unknown): string =>
  JSON.stringify(value, (_key, v) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)))
      : v,
  );

const describe = (band: Band) => {
  const limits = LIMIT_KEYS.filter((k) => band[k] != null).map((k) => `${k}=${band[k]}`);
  return `${limits.join(' ') || 'no limit'}${band.pricePerSqFt ? `, ${band.pricePerSqFt}/sq.ft` : ', itemised'}`;
};

async function main() {
  const apply = process.argv.includes('--apply');
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set');
    process.exit(1);
  }

  await mongoose.connect(uri);
  const db = mongoose.connection.db!;
  console.log(`Database: ${db.databaseName}${apply ? '' : '  (dry run — pass --apply to write)'}\n`);

  const profiles = db.collection('profiles');
  const templates = db.collection('producttemplates');
  const backups = db.collection('migration_backups');
  let problems = 0;

  // 1. SW100 profiles
  const sw100 = SAMPLE_PROFILES.filter((p) => p.code.startsWith('SW100-'));
  const existing = new Set(
    (await profiles.find({ code: { $in: sw100.map((p) => p.code) } }).toArray()).map((p) => p.code),
  );
  const toAdd = sw100.filter((p) => !existing.has(p.code));
  console.log(`Profiles: ${toAdd.length ? `add ${toAdd.map((p) => p.code).join(', ')}` : 'SW100 profiles already exist'}`);

  // 2. Window templates
  const plans: { id: mongoose.Types.ObjectId; name: string; before: Band[]; after: Band[] }[] = [];
  for (const systemType of ['sliding', 'swing'] as const) {
    const template = await templates.findOne({ productType: 'window', systemType });
    if (!template) {
      console.log(`\n${systemType} window: template not found — skipped`);
      problems++;
      continue;
    }
    const before = (template.sizeBands ?? []) as Band[];
    const bySeries = new Map(before.map((band) => [bandSeries(band), band]));
    const sample = SAMPLE_TEMPLATES.find((t) => t.productType === 'window' && t.systemType === systemType)!;

    const after: Band[] = [];
    let ok = true;
    for (const rule of RULES[systemType]) {
      let band = bySeries.get(rule.series);
      if (!band) {
        if (rule.series !== 'SW100') {
          console.log(`\n${template.name}: no band cut from ${rule.series} profiles — skipped, update it in the admin panel`);
          ok = false;
          break;
        }
        band = structuredClone(sample.sizeBands.find((b) => bandSeries(b as Band) === 'SW100')) as Band;
      }
      const updated: Band = { ...band, pricePerSqFt: rule.pricePerSqFt };
      for (const key of LIMIT_KEYS) delete updated[key];
      Object.assign(updated, rule.limits);
      after.push(updated);
    }
    if (!ok) {
      problems++;
      continue;
    }
    const others = before.filter((band) => !RULES[systemType].some((r) => r.series === bandSeries(band)));
    if (others.length) {
      console.log(`\n${template.name}: has extra bands (${others.map((b) => b.name).join(', ')}) — skipped, update it in the admin panel`);
      problems++;
      continue;
    }

    if (canonical(before) === canonical(after)) {
      console.log(`\n${template.name}: already up to date`);
      continue;
    }

    console.log(`\n${template.name}`);
    after.forEach((band, i) => {
      const old = before.find((b) => bandSeries(b) === bandSeries(band));
      console.log(`  ${i + 1}. ${band.name}`);
      console.log(`       before: ${old ? describe(old) : '(new band)'}`);
      console.log(`       after:  ${describe(band)}`);
    });
    plans.push({ id: template._id, name: template.name, before, after });
  }

  console.log(`\n${plans.length} template(s) to update, ${toAdd.length} profile(s) to add, ${problems} problem(s)`);

  if (apply) {
    if (toAdd.length) {
      const now = new Date();
      await profiles.insertMany(
        toAdd.map((p) => ({ ...p, isActive: true, isSample: true, createdAt: now, updatedAt: now })),
      );
      console.log(`Added ${toAdd.length} profile(s).`);
    }
    for (const plan of plans) {
      await backups.insertOne({
        migration: MIGRATION,
        collection: 'producttemplates',
        documentId: plan.id,
        field: 'sizeBands',
        value: plan.before,
        createdAt: new Date(),
      });
      await templates.updateOne({ _id: plan.id }, { $set: { sizeBands: plan.after, updatedAt: new Date() } });
      console.log(`Updated ${plan.name} (old bands backed up in migration_backups).`);
    }
  }

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
