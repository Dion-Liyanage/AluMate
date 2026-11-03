export interface SavedDesign {
  id: string;
  name: string;
  productType: string;
  designJson: string;
  previewImage: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "alumate_saved_designs";

const isBrowser = () => typeof window !== "undefined";

const readSavedDesigns = (): SavedDesign[] => {
  if (!isBrowser()) return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedDesign[]) : [];
  } catch {
    return [];
  }
};

const writeSavedDesigns = (designs: SavedDesign[]) => {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(designs));
};

const sortByUpdatedAtDesc = (designs: SavedDesign[]) =>
  [...designs].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

const generateId = () => {
  if (isBrowser() && typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `design-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

export const getSavedDesigns = () => sortByUpdatedAtDesc(readSavedDesigns());

export const getSavedDesignById = (id: string) =>
  readSavedDesigns().find((design) => design.id === id);

export const deleteSavedDesign = (id: string) => {
  const nextDesigns = readSavedDesigns().filter((design) => design.id !== id);
  writeSavedDesigns(nextDesigns);
};

export const upsertSavedDesign = (
  input: Omit<SavedDesign, "id" | "createdAt" | "updatedAt"> & { id?: string }
) => {
  const now = new Date().toISOString();
  const existingDesigns = readSavedDesigns();
  const existingIndex = input.id
    ? existingDesigns.findIndex((design) => design.id === input.id)
    : -1;

  if (existingIndex >= 0) {
    const existing = existingDesigns[existingIndex];
    const updated: SavedDesign = {
      ...existing,
      ...input,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: now,
    };

    existingDesigns[existingIndex] = updated;
    writeSavedDesigns(existingDesigns);
    return updated;
  }

  const created: SavedDesign = {
    id: input.id ?? generateId(),
    name: input.name,
    productType: input.productType,
    designJson: input.designJson,
    previewImage: input.previewImage,
    description: input.description,
    createdAt: now,
    updatedAt: now,
  };

  writeSavedDesigns([...existingDesigns, created]);
  return created;
};

export const createDefaultDesignName = (productType: string) => {
  const normalized = productType.charAt(0).toUpperCase() + productType.slice(1).toLowerCase();
  return `${normalized} Design`;
};