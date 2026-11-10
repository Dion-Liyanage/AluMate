import { savedDesignsApi, type SavedDesignRecord } from "@/lib/api";

/**
 * Saved designs live in the database, tied to the logged-in user, so they show
 * on every device. They used to be kept in the browser's localStorage; any
 * left there are uploaded to the account once (see importLocalSavedDesigns).
 */
export type SavedDesign = SavedDesignRecord;

// Old browser-only storage, kept only so existing designs can be imported.
const LEGACY_STORAGE_KEY = "alumate_saved_designs";
// After a successful import the old data is moved here (not deleted) as a backup.
const LEGACY_BACKUP_KEY = "alumate_saved_designs_imported";
const IMPORT_BATCH_SIZE = 10;

const isBrowser = () => typeof window !== "undefined";

interface LegacySavedDesign {
  id: string;
  name: string;
  productType: string;
  designJson: string;
  previewImage?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

const readLegacyDesigns = (): LegacySavedDesign[] => {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter(
          (d) => d && typeof d.id === "string" && typeof d.designJson === "string" && d.name && d.productType
        )
      : [];
  } catch {
    return [];
  }
};

let importInFlight: Promise<void> | null = null;

/**
 * Upload designs saved in this browser (old storage) to the user's account.
 * Safe to call repeatedly: the server only adds designs it doesn't have yet,
 * and the local copy is moved to a backup key once everything is uploaded.
 */
export const importLocalSavedDesigns = (): Promise<void> => {
  if (!isBrowser()) return Promise.resolve();
  if (importInFlight) return importInFlight;

  importInFlight = (async () => {
    const legacy = readLegacyDesigns();
    if (legacy.length === 0) return;

    let imported = 0;
    for (let i = 0; i < legacy.length; i += IMPORT_BATCH_SIZE) {
      const batch = legacy.slice(i, i + IMPORT_BATCH_SIZE).map((d) => ({
        id: d.id,
        name: d.name,
        productType: d.productType,
        designJson: d.designJson,
        previewImage: d.previewImage ?? "",
        description: d.description || undefined,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      }));
      const res = await savedDesignsApi.importMany(batch);
      imported += res.data?.imported ?? 0;
    }

    try {
      localStorage.setItem(LEGACY_BACKUP_KEY, localStorage.getItem(LEGACY_STORAGE_KEY) ?? "[]");
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      // Storage unavailable — the server ignores duplicates, so a retry is harmless.
    }

    if (imported > 0) {
      console.info(`Imported ${imported} saved design(s) from this browser to your account.`);
    }
  })().finally(() => {
    importInFlight = null;
  });

  return importInFlight;
};

const importQuietly = async () => {
  try {
    await importLocalSavedDesigns();
  } catch (err) {
    // Keep the local copy; the next page load will try again.
    console.error("Failed to import browser saved designs:", err);
  }
};

/** Newest first. Does not include designJson (use getSavedDesignById for that). */
export const getSavedDesigns = async (): Promise<SavedDesign[]> => {
  await importQuietly();
  const res = await savedDesignsApi.getAll();
  return res.data ?? [];
};

export const getSavedDesignById = async (id: string): Promise<SavedDesign | null> => {
  await importQuietly();
  try {
    const res = await savedDesignsApi.getById(id);
    return res.data ?? null;
  } catch {
    return null;
  }
};

export const deleteSavedDesign = async (id: string) => {
  await savedDesignsApi.delete(id);
};

const generateId = () => {
  if (isBrowser() && typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `design-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

export const upsertSavedDesign = async (input: {
  id?: string;
  name: string;
  productType: string;
  designJson: string;
  previewImage: string;
  description?: string;
}): Promise<SavedDesign> => {
  const id = input.id ?? generateId();
  const res = await savedDesignsApi.save(id, {
    name: input.name,
    productType: input.productType,
    designJson: input.designJson,
    previewImage: input.previewImage,
    description: input.description,
  });
  if (!res.success || !res.data) {
    throw new Error(res.message || "Failed to save design");
  }
  return res.data;
};

export const createDefaultDesignName = (productType: string) => {
  const normalized = productType.charAt(0).toUpperCase() + productType.slice(1).toLowerCase();
  return `${normalized} Design`;
};
