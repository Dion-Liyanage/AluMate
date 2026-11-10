/**
 * One-off migration: set stock bar lengths on existing aluminium profiles.
 *
 *   - profiles used by a SLIDING WINDOW template → 21 ft bars, also sold as 7 ft and 14 ft
 *   - profiles used by any other template (swing/fixed windows, all doors) → 20 ft bars
 *
 * A profile is classified by the product templates that use it, so it works for
 * admin-added profiles too. Profiles used by both a sliding window and something
 * else, or by no template at all, are left unchanged and listed for manual review.
 *
 * Dry run by default (prints the changes). Pass --apply to write them:
 *
 *   npx ts-node src/scripts/update-bar-lengths.ts            # preview
 *   npx ts-node src/scripts/update-bar-lengths.ts --apply    # write
 *
 * Uses MONGODB_URI from backend/.env, or from the environment if set there.
 * Saved order cut lists (bomSnapshot) are not changed — they keep the bar
 * lengths that were in effect when the order was placed.
 */
import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import { join } from 'path';

dotenv.config({ path: join(__dirname, '../../.env') });

const SLIDING_WINDOW = { barLengthFt: 21, shorterLengthsFt: [7, 14] };
const STANDARD = { barLengthFt: 20, shorterLengthsFt: [] as number[] };

interface TemplateDoc {
  name: string;
  productType: string;
  systemType: string;
  sizeBands?: { lines?: { profileCode: string }[] }[];
}

interface ProfileDoc {
  _id: mongoose.Types.ObjectId;
  code: string;
  barLengthFt: number;
  shorterLengthsFt?: number[];
}

const sameLengths = (a: number[] = [], b: number[] = []) =>
  a.length === b.length && [...a].sort((x, y) => x - y).every((v, i) => v === [...b].sort((x, y) => x - y)[i]);

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

  const templates = await db.collection<TemplateDoc>('producttemplates').find().toArray();
  const profiles = await db.collection<ProfileDoc>('profiles').find().toArray();

  // profile code → set of "sliding-window" | "other"
  const usage = new Map<string, Set<'sliding-window' | 'other'>>();
  for (const template of templates) {
    const kind = template.productType === 'window' && template.systemType === 'sliding' ? 'sliding-window' : 'other';
    for (const band of template.sizeBands ?? []) {
      for (const line of band.lines ?? []) {
        const code = line.profileCode?.toUpperCase();
        if (!code) continue;
        if (!usage.has(code)) usage.set(code, new Set());
        usage.get(code)!.add(kind);
      }
    }
  }

  const updates: { profile: ProfileDoc; target: typeof STANDARD }[] = [];
  const unchanged: string[] = [];
  const review: string[] = [];

  for (const profile of profiles) {
    const kinds = usage.get(profile.code) ?? new Set();
    if (kinds.size === 0) {
      review.push(`${profile.code}: not used by any template`);
      continue;
    }
    if (kinds.size > 1) {
      review.push(`${profile.code}: used by sliding windows AND other products`);
      continue;
    }
    const target = kinds.has('sliding-window') ? SLIDING_WINDOW : STANDARD;
    if (profile.barLengthFt === target.barLengthFt && sameLengths(profile.shorterLengthsFt, target.shorterLengthsFt)) {
      unchanged.push(profile.code);
    } else {
      updates.push({ profile, target });
    }
  }

  for (const { profile, target } of updates) {
    const from = `${profile.barLengthFt} ft${profile.shorterLengthsFt?.length ? ` (+${profile.shorterLengthsFt.join('/')})` : ''}`;
    const to = `${target.barLengthFt} ft${target.shorterLengthsFt.length ? ` (+${target.shorterLengthsFt.join('/')})` : ''}`;
    console.log(`  ${profile.code.padEnd(12)} ${from.padEnd(18)} → ${to}`);
  }
  console.log(`\n${updates.length} to update, ${unchanged.length} already correct, ${review.length} need review`);
  for (const line of review) console.log(`  review: ${line}`);

  if (apply && updates.length) {
    const result = await db.collection('profiles').bulkWrite(
      updates.map(({ profile, target }) => ({
        updateOne: {
          filter: { _id: profile._id },
          update: { $set: { ...target, updatedAt: new Date() } },
        },
      })),
    );
    console.log(`\nUpdated ${result.modifiedCount} profile(s).`);
  }

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
