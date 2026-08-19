import jsPDF from "jspdf";

const MARGIN = 15;
const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const LINE_HEIGHT = 6;

const stripMarkdown = (text) => {
  return text
    .replace(/```[\s\S]*?```/g, (match) => match.replace(/```/g, ""))
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/^-\s+/gm, "• ");
};

export const generateReportPdf = (report) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGIN;

  const ensureSpace = (needed) => {
    if (y + needed > PAGE_HEIGHT - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  };

  const addHeading = (text, size = 14) => {
    ensureSpace(LINE_HEIGHT + 4);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size);
    doc.setTextColor(20, 20, 20);
    doc.text(text, MARGIN, y);
    y += LINE_HEIGHT + 2;
  };

  const addParagraph = (text, size = 10) => {
    if (!text) return;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(text, CONTENT_WIDTH);
    lines.forEach((line) => {
      ensureSpace(LINE_HEIGHT);
      doc.text(line, MARGIN, y);
      y += LINE_HEIGHT;
    });
    y += 3;
  };

  const addList = (items) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    items.forEach((item) => {
      const lines = doc.splitTextToSize(`•  ${item}`, CONTENT_WIDTH - 4);
      lines.forEach((line, i) => {
        ensureSpace(LINE_HEIGHT);
        doc.text(line, MARGIN + (i === 0 ? 0 : 4), y);
        y += LINE_HEIGHT;
      });
    });
    y += 3;
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(20, 20, 20);
  doc.text(report.repository?.name || "Repository Report", MARGIN, y);
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(`CodeDNA Analysis Report — Generated ${new Date().toLocaleDateString()}`, MARGIN, y);
  y += 12;

  const metrics = report.metrics || [];
  const maintainability = Math.round(report.maintainabilityScore?.average_maintainability ?? 0);
  const bugProbability = Math.round((report.riskModules?.average_bug_probability ?? 0) * 100);
  const highRisk = report.riskModules?.high_risk_file_count ?? 0;

  addHeading("Key Metrics", 13);
  addList([
    `Total files analyzed: ${metrics.length}`,
    `Maintainability score: ${maintainability} / 100`,
    `Average bug probability: ${bugProbability}%`,
    `High risk files: ${highRisk}`,
  ]);

  const documentation = report.documentation || {};

  if (documentation.summary) {
    addHeading("Overview");
    addParagraph(documentation.summary);
  }

  if (documentation.architecture_overview) {
    addHeading("Architecture Overview");
    addParagraph(documentation.architecture_overview);
  }

  if (documentation.quality_assessment) {
    addHeading("Quality Assessment");
    addParagraph(documentation.quality_assessment);
  }

  if (documentation.insights?.length > 0) {
    addHeading("Key Insights");
    addList(documentation.insights);
  }

  if (documentation.recommendations) {
    addHeading("Recommendations");
    addParagraph(documentation.recommendations);
  }

  if (documentation.readme) {
    addHeading("README");
    addParagraph(stripMarkdown(documentation.readme));
  }

  doc.save(`${(report.repository?.name || "report").replace(/\s+/g, "-")}-codedna-report.pdf`);
};