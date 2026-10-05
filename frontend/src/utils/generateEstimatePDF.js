import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SITE } from './siteConfig';

// ── Helpers ────────────────────────────────────────────────
function fmtINR(n) {
  return '\u20B9' + n.toLocaleString('en-IN');
}

function fmtDate() {
  return new Date().toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Colour palette (mirrors website: #0A1628 navy, #F97316 orange) ──
const NAVY   = [10,  22,  40];
const ORANGE = [249, 115, 22];
const LIGHT  = [245, 246, 250];
const WHITE  = [255, 255, 255];
const GRAY   = [107, 114, 128];
const AMBER  = [180, 120, 20];

// ── Main export ────────────────────────────────────────────
export function generatePDF(form, result) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const PW = doc.internal.pageSize.getWidth();   // 210
  const PH = doc.internal.pageSize.getHeight();  // 297
  let y = 0;

  // ── 1. HEADER BAND ────────────────────────────────────────
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PW, 38, 'F');

  // Company name
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('NP Construction', 14, 14);

  // Tagline
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255, 0.7);
  doc.text('Structural Steel & Iron Contractor', 14, 20);

  // Orange accent line
  doc.setFillColor(...ORANGE);
  doc.rect(14, 23, 60, 1.2, 'F');

  // Report title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...WHITE);
  doc.text('STEEL QUANTITY ESTIMATE REPORT', 14, 30);

  // Date (right-aligned)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(200, 210, 225);
  doc.text(`Generated: ${fmtDate()}`, PW - 14, 14, { align: 'right' });
  doc.text('npconstructionco.com', PW - 14, 20, { align: 'right' });

  y = 48;

  // ── 2. PROJECT DETAILS SECTION ────────────────────────────
  const totalBUA = (parseFloat(form.plotArea) * parseInt(form.floors)).toLocaleString('en-IN');

  sectionTitle(doc, 'PROJECT DETAILS', y);
  y += 8;

  const details = [
    ['Plot Area',          `${parseFloat(form.plotArea).toLocaleString('en-IN')} sq.ft`],
    ['Number of Floors',   form.floors],
    ['Construction Type',  form.constructionType],
    ['Total Built-up Area', `${totalBUA} sq.ft`],
  ];

  details.forEach(([label, value], i) => {
    const rowY = y + i * 7;
    if (i % 2 === 0) {
      doc.setFillColor(...LIGHT);
      doc.roundedRect(14, rowY - 3.5, PW - 28, 7, 1, 1, 'F');
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text(label, 18, rowY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...NAVY);
    doc.text(String(value), PW - 18, rowY, { align: 'right' });
  });

  y += details.length * 7 + 8;

  // ── 3. SUMMARY SECTION ────────────────────────────────────
  sectionTitle(doc, 'ESTIMATE SUMMARY', y);
  y += 8;

  // Row 1: Total Steel (Orange highlight)
  doc.setFillColor(...ORANGE);
  doc.roundedRect(14, y - 4.5, PW - 28, 8, 1.5, 1.5, 'F');
  doc.setTextColor(...WHITE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('Total Structural Steel Required', 18, y);
  doc.text(`${result.structKg.toLocaleString('en-IN')} kg  (${result.structTon} MT)`, PW - 18, y, { align: 'right' });
  y += 11;

  // Row 2: Cost Range
doc.setFillColor(...LIGHT);
doc.roundedRect(14, y - 4.5, PW - 28, 10, 1, 1, 'F');
doc.setTextColor(...NAVY);
doc.setFont('helvetica', 'bold');
doc.setFontSize(7.5);
doc.text('Estimated Cost Range', 18, y);

// Cost range in ONE line with smaller font
doc.setFont('helvetica', 'bold');
doc.setFontSize(7);
const costText = `${fmtINR(result.strMinCost)}  to  ${fmtINR(result.strMaxCost)}`;
doc.text(costText, PW - 18, y, { align: 'right' });
y += 13;


  // Row 3: Steel Grade
  doc.setTextColor(...NAVY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('Recommended Steel Grade', 18, y);
  doc.text(result.grade, PW - 18, y, { align: 'right' });
  y += 11;

  // ── 4. BAR-WISE BREAKDOWN TABLE ───────────────────────────
  sectionTitle(doc, 'BAR-SIZE WISE BREAKDOWN  (Standard 12m length bars)', y);
  y += 6;

  // Filter out zero-kg rows
  const tableRows = result.barBreakdown
    .filter(b => b.kg > 0)
    .map(b => [
      `${b.dia} mm`,
      `${b.kg.toLocaleString('en-IN')} kg`,
      b.bars.toLocaleString('en-IN'),
      `${((b.kg / result.structKg) * 100).toFixed(1)}%`,
    ]);

  // Totals row
  const totalBars = result.barBreakdown.reduce((s, b) => s + b.bars, 0);
  tableRows.push([
    'TOTAL',
    `${result.structKg.toLocaleString('en-IN')} kg`,
    totalBars.toLocaleString('en-IN'),
    '100%',
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Diameter (mm)', 'Weight (kg)', 'No. of Bars (12m)', '% of Total']],
    body: tableRows,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: { top: 2.5, bottom: 2.5, left: 4, right: 4 },
      textColor: [...NAVY],
      lineColor: [220, 220, 230],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [...NAVY],
      textColor: [...WHITE],
      fontStyle: 'bold',
      fontSize: 7.5,
    },
    alternateRowStyles: {
      fillColor: [...LIGHT],
    },
    // Style the TOTAL row differently
    didParseCell(data) {
      if (data.row.index === tableRows.length - 1) {
        data.cell.styles.fillColor = [...ORANGE];
        data.cell.styles.textColor = [...WHITE];
        data.cell.styles.fontStyle = 'bold';
      }
    },
    margin: { left: 14, right: 14 },
  });

  y = doc.lastAutoTable.finalY + 10;

  // ── 5. DISCLAIMER ─────────────────────────────────────────
  // New page if not enough space
  if (y > PH - 60) { doc.addPage(); y = 20; }

  doc.setFillColor(255, 251, 235);
  doc.setDrawColor(...AMBER);
  doc.roundedRect(14, y, PW - 28, 16, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...AMBER);
  doc.text('⚠  DISCLAIMER', 19, y + 5.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(120, 90, 20);
  const disclaimer =
    'This is an approximate estimate only. Final quantity depends on the structural engineer\'s design, ' +
    'connection details, and site conditions. Always consult a qualified structural engineer before procurement.';
  const lines = doc.splitTextToSize(disclaimer, PW - 42);
  doc.text(lines, 19, y + 10.5);

  y += 22;

  // ── 6. FOOTER BAND ────────────────────────────────────────
  const footerY = PH - 24;
  doc.setFillColor(...NAVY);
  doc.rect(0, footerY, PW, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...ORANGE);
  doc.text('NP Construction', 14, footerY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(200, 210, 225);

  const contactLine = `${SITE.phone}  |  wa.me/${SITE.whatsapp}  |  ${SITE.email}`;
  doc.text(contactLine, 14, footerY + 13);

  doc.setTextColor(150, 165, 185);
  doc.setFontSize(6.5);
  doc.text(
    'Generated via NP Construction Steel Estimator — npconstructionco.com',
    PW - 14, footerY + 13, { align: 'right' }
  );

  // Page number
  doc.setFontSize(6.5);
  doc.setTextColor(150, 165, 185);
  doc.text(`Page 1 of ${doc.getNumberOfPages()}`, PW / 2, footerY + 20, { align: 'center' });

  // ── SAVE ──────────────────────────────────────────────────
  const dateStr = new Date().toISOString().split('T')[0];
  doc.save(`NP-Construction-Steel-Estimate-${dateStr}.pdf`);
}

// ── Small helper: draws an orange-accented section title ──
function sectionTitle(doc, text, y) {
  const PW = doc.internal.pageSize.getWidth();
  doc.setFillColor(249, 115, 22, 0.12);
  doc.setDrawColor(249, 115, 22);
  doc.roundedRect(14, y - 4.5, PW - 28, 8, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(180, 70, 10);
  doc.text(text, 18, y);
}
