import type { SustainabilityDashboardData } from "@/lib/api";

/**
 * Builds the Green Fabrication report as a PDF in the browser and downloads it.
 * The PDF libraries are loaded only when the admin clicks the button.
 */
export async function downloadSustainabilityReport(data: SustainabilityDashboardData) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const generatedAt = new Date();

  const kg = (value: number) => `${(value ?? 0).toLocaleString("en-US", { maximumFractionDigits: 2 })} kg`;
  const pct = (value: number) => `${(value ?? 0).toLocaleString("en-US", { maximumFractionDigits: 1 })}%`;
  const lkr = (value: number) => `Rs. ${Math.round(value ?? 0).toLocaleString("en-US")}`;
  const date = (iso: string) =>
    iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-";

  const green: [number, number, number] = [16, 185, 129];
  const tableStyle = {
    theme: "grid" as const,
    headStyles: { fillColor: green, textColor: 255, fontStyle: "bold" as const },
    styles: { fontSize: 9, cellPadding: 2 },
    margin: { left: margin, right: margin },
  };

  // Each section starts below the previous table.
  let y = 0;
  const lastY = () => (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y;
  const heading = (text: string) => {
    y = lastY() + 10;
    if (y > doc.internal.pageSize.getHeight() - 30) {
      doc.addPage();
      y = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(20);
    doc.text(text, margin, y);
    y += 3;
  };
  const emptyRow = (cols: number) => [[{ content: "No records yet", colSpan: cols, styles: { halign: "center" as const, textColor: 120 } }]];

  // ---------- Header ----------
  doc.setFillColor(...green);
  doc.rect(0, 0, pageWidth, 26, "F");
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("AluMate", margin, 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Green Fabrication Report", margin, 20);
  doc.setFontSize(9);
  doc.text(
    `Generated ${generatedAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}`,
    pageWidth - margin,
    20,
    { align: "right" },
  );

  doc.setTextColor(80);
  doc.setFontSize(9);
  doc.text("Aluminium use, reusable offcuts and fabrication waste across all recorded jobs.", margin, 34);
  y = 36;

  // ---------- Summary ----------
  const { summary, planAccuracy } = data;
  heading("Summary");
  autoTable(doc, {
    ...tableStyle,
    startY: y,
    head: [["Measure", "Value"]],
    body: [
      ["Aluminium purchased", kg(summary.purchasedKg)],
      ["Aluminium used", kg(summary.usedKg)],
      ["Material efficiency", pct(summary.efficiencyPct)],
      ["Reusable offcuts (available for future jobs)", kg(summary.reusableOffcutsKg)],
      ["Scrap waste", kg(summary.scrapWasteKg)],
      ["Waste rate (scrap / purchased)", pct(summary.wasteRate)],
      ["Estimated cost saved by reusing offcuts", lkr(summary.costSaved)],
    ],
    columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
  });

  // ---------- Cutting plan accuracy ----------
  if (planAccuracy) {
    heading("Cutting Plan Accuracy");
    autoTable(doc, {
      ...tableStyle,
      startY: y,
      head: [["Measure", "Value"]],
      body: [
        ["Orders with a cutting plan", `${planAccuracy.ordersWithPlan} of ${planAccuracy.totalOrders}`],
        ["Planned waste rate", pct(planAccuracy.plannedWasteRate)],
        ["Actual waste rate", pct(planAccuracy.actualWasteRate)],
        ["Extra scrap beyond plan", kg(planAccuracy.extraScrapKg)],
      ],
      columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
    });
  }

  // ---------- Projects ----------
  heading("Material Usage by Project");
  autoTable(doc, {
    ...tableStyle,
    startY: y,
    head: [["Project", "Purchased", "Used", "Reusable", "Scrap", "Waste rate"]],
    body: data.projects.length
      ? data.projects.map((p) => [p.project, kg(p.purchased), kg(p.used), kg(p.reusable), kg(p.scrap), pct(p.wasteRate)])
      : emptyRow(6),
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" }, 4: { halign: "right" }, 5: { halign: "right" } },
  });

  // ---------- Planned vs actual ----------
  heading("Planned vs Actual Waste");
  autoTable(doc, {
    ...tableStyle,
    startY: y,
    head: [["Order", "Project", "Completed", "Planned scrap", "Actual scrap", "Planned %", "Actual %"]],
    body: data.plannedVsActual.length
      ? data.plannedVsActual.map((o) => [
          o.orderNumber,
          o.projectName,
          date(o.recordedAt),
          kg(o.plannedScrapKg),
          kg(o.actualScrapKg),
          pct(o.plannedWasteRate),
          pct(o.actualWasteRate),
        ])
      : emptyRow(7),
    columnStyles: { 3: { halign: "right" }, 4: { halign: "right" }, 5: { halign: "right" }, 6: { halign: "right" } },
  });

  // ---------- High-waste orders ----------
  if (data.highWasteOrders.length) {
    heading("Orders Above Planned Waste");
    autoTable(doc, {
      ...tableStyle,
      startY: y,
      head: [["Order", "Project", "Planned %", "Actual %", "Extra scrap"]],
      body: data.highWasteOrders.map((o) => [
        o.orderNumber,
        o.projectName,
        pct(o.plannedWasteRate),
        pct(o.actualWasteRate),
        kg(o.extraScrapKg),
      ]),
      columnStyles: { 2: { halign: "right" }, 3: { halign: "right" }, 4: { halign: "right" } },
    });
  }

  // ---------- Monthly waste ----------
  heading("Monthly Waste Rate");
  autoTable(doc, {
    ...tableStyle,
    startY: y,
    head: [["Month", "Waste rate"]],
    body: data.monthlyWaste.length ? data.monthlyWaste.map((m) => [m.month, pct(m.wasteRate)]) : emptyRow(2),
    columnStyles: { 1: { halign: "right" } },
  });

  // ---------- Page numbers ----------
  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(140);
    const bottom = doc.internal.pageSize.getHeight() - 8;
    doc.text("AluMate - Green Fabrication Report", margin, bottom);
    doc.text(`Page ${page} of ${pageCount}`, pageWidth - margin, bottom, { align: "right" });
  }

  const stamp = generatedAt.toISOString().slice(0, 10);
  doc.save(`alumate-green-fabrication-report-${stamp}.pdf`);
}
