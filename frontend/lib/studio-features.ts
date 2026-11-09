/**
 * Reads a Design Studio (Fabric.js) canvas JSON and counts the structural
 * aluminium bars the customer drew. These become extra mullions (vertical)
 * and transoms (horizontal) in the bill of materials.
 */

export interface StudioFeatures {
  verticalBars: number;
  horizontalBars: number;
}

const BAR_COMPONENT_IDS = new Set(["vertical-bar", "horizontal-bar", "aluminium-bar", "bar"]);
const MAX_BARS = 20;

type FabricObject = {
  componentId?: string;
  width?: number;
  height?: number;
  scaleX?: number;
  scaleY?: number;
  angle?: number;
  objects?: FabricObject[];
};

export function extractStudioFeatures(designJson?: string | null): StudioFeatures | undefined {
  if (!designJson) return undefined;

  let parsed: { objects?: FabricObject[] };
  try {
    parsed = JSON.parse(designJson);
  } catch {
    return undefined;
  }

  let verticalBars = 0;
  let horizontalBars = 0;

  const visit = (object: FabricObject) => {
    if (Array.isArray(object.objects) && object.objects.length > 0) {
      object.objects.forEach(visit);
      return;
    }
    if (!object.componentId || !BAR_COMPONENT_IDS.has(object.componentId)) return;

    // Decide by the drawn shape (bars can be resized or rotated on the canvas).
    const width = (object.width ?? 0) * Math.abs(object.scaleX ?? 1);
    const height = (object.height ?? 0) * Math.abs(object.scaleY ?? 1);
    const rotated = Math.round(((object.angle ?? 0) % 180) / 90) % 2 === 1;
    const isVertical = rotated ? width > height : height > width;
    if (isVertical) verticalBars++;
    else horizontalBars++;
  };

  (parsed.objects ?? []).forEach(visit);

  return {
    verticalBars: Math.min(verticalBars, MAX_BARS),
    horizontalBars: Math.min(horizontalBars, MAX_BARS),
  };
}
