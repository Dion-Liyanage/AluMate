/**
 * Workshop cutting settings used by the cutting optimiser.
 * (Planned to become admin-editable shop settings in a later phase.)
 */
export interface CuttingSettings {
  /** Material lost to the saw blade on every cut, in inches (≈3 mm blade). */
  kerfIn: number;
  /** Leftovers at least this long are kept as reusable offcuts; shorter ones are scrap. */
  minReusableOffcutIn: number;
}

export const DEFAULT_CUTTING_SETTINGS: CuttingSettings = {
  kerfIn: 0.125,
  minReusableOffcutIn: 18,
};
