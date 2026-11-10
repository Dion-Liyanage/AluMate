/**
 * SAMPLE material catalogue, loaded automatically the first time the
 * materials collections are empty. Every value here is illustrative —
 * replace weights, prices and cut deductions with figures from your
 * profile supplier's catalogue and your workshop's fabrication sheets
 * using the admin "Aluminium Profiles" and "Product Templates" pages.
 *
 * Formula variables (lengths in inches):
 *   W  overall width     H  overall height     P  panels / sashes / leaves
 *   MV extra vertical bars from the design     TR extra horizontal bars
 */

type SampleProfile = {
  code: string;
  name: string;
  series: string;
  shape: string;
  thicknessMm: number;
  weightKgPerM: number;
  barLengthFt: number;
  shorterLengthsFt: number[];
  pricePerFt: number;
};

/**
 * Stock bar lengths by product family:
 *   - sliding window profiles: 21 ft bars, also sold as 7 ft and 14 ft pieces
 *   - swing / fixed (casement) window profiles and glazing bead: 20 ft bars
 *   - all door profiles: 20 ft bars
 */
export const SLIDING_WINDOW_BAR = { barLengthFt: 21, shorterLengthsFt: [7, 14] };
export const STANDARD_BAR = { barLengthFt: 20, shorterLengthsFt: [] as number[] };

const profile = (
  code: string,
  name: string,
  series: string,
  shape: string,
  thicknessMm: number,
  weightKgPerM: number,
  pricePerFt: number,
): SampleProfile => ({
  code,
  name,
  series,
  shape,
  thicknessMm,
  weightKgPerM,
  ...(code.startsWith('SW') ? SLIDING_WINDOW_BAR : STANDARD_BAR),
  shorterLengthsFt: code.startsWith('SW') ? [...SLIDING_WINDOW_BAR.shorterLengthsFt] : [],
  pricePerFt,
});

export const SAMPLE_PROFILES: SampleProfile[] = [
  // 70mm sliding window — standard
  profile('SW70-TRK', 'Sliding Track Frame', '70mm Sliding Window', 'track', 1.2, 0.62, 420),
  profile('SW70-JMB', 'Sliding Side Jamb', '70mm Sliding Window', 'jamb', 1.2, 0.48, 340),
  profile('SW70-SSH', 'Sliding Sash Rail & Stile', '70mm Sliding Window', 'sash', 1.2, 0.52, 360),
  profile('SW70-INT', 'Sliding Interlock', '70mm Sliding Window', 'interlock', 1.2, 0.58, 390),
  // 80mm sliding window — heavy
  profile('SW80-TRK', 'Heavy Sliding Track Frame', '80mm Sliding Window', 'track', 1.4, 0.86, 560),
  profile('SW80-JMB', 'Heavy Sliding Side Jamb', '80mm Sliding Window', 'jamb', 1.4, 0.66, 450),
  profile('SW80-SSH', 'Heavy Sliding Sash', '80mm Sliding Window', 'sash', 1.4, 0.72, 480),
  profile('SW80-INT', 'Heavy Sliding Interlock', '80mm Sliding Window', 'interlock', 1.4, 0.8, 520),
  // 100mm sliding window — extra large (placeholder weights & prices: replace with supplier figures)
  profile('SW100-TRK', 'XL Sliding Track Frame', '100mm Sliding Window', 'track', 1.6, 1.1, 700),
  profile('SW100-JMB', 'XL Sliding Side Jamb', '100mm Sliding Window', 'jamb', 1.6, 0.85, 560),
  profile('SW100-SSH', 'XL Sliding Sash', '100mm Sliding Window', 'sash', 1.6, 0.95, 600),
  profile('SW100-INT', 'XL Sliding Interlock', '100mm Sliding Window', 'interlock', 1.6, 1.05, 650),
  // 41mm casement — standard swing & fixed windows
  profile('CW41-FRM', 'Casement Outer Frame', '41mm Casement', 'frame', 1.2, 0.55, 380),
  profile('CW41-SSH', 'Casement Sash', '41mm Casement', 'sash', 1.2, 0.5, 360),
  profile('CW41-MUL', 'Casement Mullion / Transom', '41mm Casement', 'mullion', 1.2, 0.62, 410),
  // 60mm casement — heavy swing & fixed windows
  profile('CW60-FRM', 'Heavy Casement Outer Frame', '60mm Casement', 'frame', 1.4, 0.78, 520),
  profile('CW60-SSH', 'Heavy Casement Sash', '60mm Casement', 'sash', 1.4, 0.7, 480),
  profile('CW60-MUL', 'Heavy Casement Mullion / Transom', '60mm Casement', 'mullion', 1.4, 0.85, 560),
  // Shared glazing bead
  profile('GB-STD', 'Glazing Bead', 'Accessories', 'bead', 1.0, 0.14, 120),
  // 100mm sliding door — standard
  profile('SD100-TRK', 'Sliding Door Track Frame', '100mm Sliding Door', 'track', 1.6, 1.28, 820),
  profile('SD100-JMB', 'Sliding Door Side Jamb', '100mm Sliding Door', 'jamb', 1.6, 0.98, 640),
  profile('SD100-SSH', 'Sliding Door Sash', '100mm Sliding Door', 'sash', 1.6, 1.12, 720),
  profile('SD100-INT', 'Sliding Door Interlock', '100mm Sliding Door', 'interlock', 1.6, 1.05, 690),
  // 120mm sliding door — heavy
  profile('SD120-TRK', 'Heavy Sliding Door Track', '120mm Sliding Door', 'track', 2.0, 1.65, 1050),
  profile('SD120-JMB', 'Heavy Sliding Door Jamb', '120mm Sliding Door', 'jamb', 2.0, 1.25, 820),
  profile('SD120-SSH', 'Heavy Sliding Door Sash', '120mm Sliding Door', 'sash', 2.0, 1.42, 920),
  profile('SD120-INT', 'Heavy Sliding Door Interlock', '120mm Sliding Door', 'interlock', 2.0, 1.36, 880),
  // 100mm swing door — standard
  profile('DR100-FRM', 'Door Frame', '100mm Swing Door', 'frame', 1.6, 1.05, 700),
  profile('DR100-STL', 'Door Leaf Stile & Top Rail', '100mm Swing Door', 'sash', 1.6, 1.18, 760),
  profile('DR100-BTM', 'Door Bottom Rail', '100mm Swing Door', 'rail', 1.6, 1.52, 940),
  profile('DR100-MID', 'Door Mid Rail', '100mm Swing Door', 'rail', 1.6, 0.96, 640),
  // 120mm swing door — heavy
  profile('DR120-FRM', 'Heavy Door Frame', '120mm Swing Door', 'frame', 2.0, 1.35, 880),
  profile('DR120-STL', 'Heavy Door Leaf Stile & Top Rail', '120mm Swing Door', 'sash', 2.0, 1.48, 950),
  profile('DR120-BTM', 'Heavy Door Bottom Rail', '120mm Swing Door', 'rail', 2.0, 1.85, 1150),
  profile('DR120-MID', 'Heavy Door Mid Rail', '120mm Swing Door', 'rail', 2.0, 1.2, 780),
];

type Line = [component: string, profileCode: string, quantity: string, length: string, angle: 45 | 90];

const lines = (rows: Line[]) =>
  rows.map(([component, profileCode, quantityFormula, lengthFormula, cutAngle]) => ({
    component,
    profileCode,
    quantityFormula,
    lengthFormula,
    cutAngle,
  }));

const slidingLines = (prefix: string, railAdd: number, stileDeduct: number) =>
  lines([
    ['Outer frame – top & bottom track', `${prefix}-TRK`, '2', 'W', 45],
    ['Outer frame – side jambs', `${prefix}-JMB`, '2', 'H', 45],
    ['Sash – top & bottom rails', `${prefix}-SSH`, '2 * P', `(W - 2) / P + ${railAdd}`, 90],
    ['Sash – outer stiles', `${prefix}-SSH`, '2', `H - ${stileDeduct}`, 90],
    ['Sash – interlock stiles', `${prefix}-INT`, '2 * (P - 1)', `H - ${stileDeduct}`, 90],
    ['Fixed transom (design bars)', `${prefix}-JMB`, 'TR', 'W - 1.5', 90],
  ]);

const casementLines = (prefix: string) =>
  lines([
    ['Outer frame – head & sill', `${prefix}-FRM`, '2', 'W', 45],
    ['Outer frame – jambs', `${prefix}-FRM`, '2', 'H', 45],
    ['Mullions between sashes', `${prefix}-MUL`, 'P - 1 + MV', 'H - 2', 90],
    ['Transoms (design bars)', `${prefix}-MUL`, 'TR', 'W - 2', 90],
    ['Sash – top & bottom rails', `${prefix}-SSH`, '2 * P', '(W - 2) / P - 0.5', 45],
    ['Sash – stiles', `${prefix}-SSH`, '2 * P', 'H - 2.5', 45],
  ]);

const fixedLines = (prefix: string) =>
  lines([
    ['Frame – head & sill', `${prefix}-FRM`, '2', 'W', 45],
    ['Frame – jambs', `${prefix}-FRM`, '2', 'H', 45],
    ['Mullions (design bars)', `${prefix}-MUL`, 'MV', 'H - 2', 90],
    ['Transoms (design bars)', `${prefix}-MUL`, 'TR * (MV + 1)', '(W - 2) / (MV + 1)', 90],
    ['Glazing bead – horizontal', 'GB-STD', '2 * (MV + 1) * (TR + 1)', '(W - 2) / (MV + 1)', 45],
    ['Glazing bead – vertical', 'GB-STD', '2 * (MV + 1) * (TR + 1)', '(H - 2) / (TR + 1)', 45],
  ]);

const swingDoorLines = (prefix: string) =>
  lines([
    ['Door frame – head', `${prefix}-FRM`, '1', 'W', 45],
    ['Door frame – jambs', `${prefix}-FRM`, '2', 'H', 45],
    ['Leaf – stiles', `${prefix}-STL`, '2 * P', 'H - 1.5', 45],
    ['Leaf – top rails', `${prefix}-STL`, 'P', '(W - 2) / P - 0.5', 45],
    ['Leaf – bottom rails', `${prefix}-BTM`, 'P', '(W - 2) / P - 4.5', 90],
    ['Leaf – mid rails', `${prefix}-MID`, 'P * max(1, TR)', '(W - 2) / P - 4.5', 90],
    ['Glazing bead – horizontal', 'GB-STD', '2 * P * (max(1, TR) + 1)', '(W - 2) / P - 4.5', 45],
    ['Glazing bead – vertical', 'GB-STD', '2 * P * (max(1, TR) + 1)', '(H - 6) / (max(1, TR) + 1)', 45],
  ]);

export const SAMPLE_TEMPLATES = [
  {
    productType: 'window',
    systemType: 'sliding',
    name: 'Sliding Window',
    description: 'Horizontal sliding sashes on a top & bottom track.',
    minPanels: 2,
    maxPanels: 4,
    defaultPanels: 2,
    sizeBands: [
      // Up to 6 ft wide × 4 ft high
      {
        name: 'Standard – 70mm series',
        maxWidthFt: 6,
        maxHeightFt: 4,
        pricePerSqFt: 3000,
        laborRatePerSqFt: 250,
        glassRatePerSqFt: 650,
        hardwareCostPerPanel: 1800,
        lines: slidingLines('SW70', 1, 2.5),
      },
      // Up to 8 ft wide × 10 ft high
      {
        name: 'Large – 80mm heavy series',
        maxWidthFt: 8,
        maxHeightFt: 10,
        pricePerSqFt: 4500,
        laborRatePerSqFt: 300,
        glassRatePerSqFt: 750,
        hardwareCostPerPanel: 2400,
        lines: slidingLines('SW80', 1.25, 3),
      },
      // Anything larger
      {
        name: 'Extra large – 100mm series',
        pricePerSqFt: 7000,
        laborRatePerSqFt: 350,
        glassRatePerSqFt: 850,
        hardwareCostPerPanel: 3000,
        lines: slidingLines('SW100', 1.5, 3.5),
      },
    ],
  },
  {
    productType: 'window',
    systemType: 'swing',
    name: 'Swing (Casement) Window',
    description: 'Side-hinged sashes that swing open.',
    minPanels: 1,
    maxPanels: 3,
    defaultPanels: 1,
    sizeBands: [
      // Up to 4 ft wide, any height
      {
        name: 'Standard – 41mm casement',
        maxWidthFt: 4,
        pricePerSqFt: 3000,
        laborRatePerSqFt: 250,
        glassRatePerSqFt: 650,
        hardwareCostPerPanel: 2200,
        lines: casementLines('CW41'),
      },
      // Wider than 4 ft
      {
        name: 'Large – 60mm heavy casement',
        pricePerSqFt: 4500,
        laborRatePerSqFt: 320,
        glassRatePerSqFt: 750,
        hardwareCostPerPanel: 2800,
        lines: casementLines('CW60'),
      },
    ],
  },
  {
    productType: 'window',
    systemType: 'fixed',
    name: 'Fixed Window',
    description: 'Non-opening glazed window, divided by optional bars.',
    minPanels: 1,
    maxPanels: 1,
    defaultPanels: 1,
    sizeBands: [
      {
        name: 'Standard – 41mm frame',
        maxAreaSqFt: 40,
        laborRatePerSqFt: 180,
        glassRatePerSqFt: 600,
        hardwareCostPerPanel: 0,
        lines: fixedLines('CW41'),
      },
      {
        name: 'Large – 60mm frame',
        laborRatePerSqFt: 220,
        glassRatePerSqFt: 700,
        hardwareCostPerPanel: 0,
        lines: fixedLines('CW60'),
      },
    ],
  },
  {
    productType: 'door',
    systemType: 'sliding',
    name: 'Sliding Door',
    description: 'Sliding glass door panels on a floor track.',
    minPanels: 2,
    maxPanels: 4,
    defaultPanels: 2,
    sizeBands: [
      {
        name: 'Standard – 100mm series',
        maxHeightFt: 8,
        maxAreaSqFt: 60,
        laborRatePerSqFt: 400,
        glassRatePerSqFt: 900,
        hardwareCostPerPanel: 4500,
        lines: slidingLines('SD100', 1.25, 3.5),
      },
      {
        name: 'Heavy – 120mm series',
        laborRatePerSqFt: 500,
        glassRatePerSqFt: 1000,
        hardwareCostPerPanel: 6000,
        lines: slidingLines('SD120', 1.5, 4),
      },
    ],
  },
  {
    productType: 'door',
    systemType: 'swing',
    name: 'Swing Door',
    description: 'Hinged single or double leaf door.',
    minPanels: 1,
    maxPanels: 2,
    defaultPanels: 1,
    sizeBands: [
      {
        name: 'Standard – 100mm series',
        maxPanelWidthFt: 3.5,
        maxHeightFt: 7.5,
        laborRatePerSqFt: 150,
        glassRatePerSqFt: 700,
        hardwareCostPerPanel: 6500,
        lines: swingDoorLines('DR100'),
      },
      {
        name: 'Heavy – 120mm series',
        laborRatePerSqFt: 200,
        glassRatePerSqFt: 800,
        hardwareCostPerPanel: 8500,
        lines: swingDoorLines('DR120'),
      },
    ],
  },
];
