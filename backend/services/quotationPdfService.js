import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

function safeFilePart(input) {
  return String(input || '')
    .trim()
    .replace(/[^a-z0-9-_]+/gi, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80) || 'quotation';
}

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function round2(n) {
  return Math.round(toNum(n) * 100) / 100;
}

function money(n) {
  return `Rs.${round2(n).toFixed(2)}`;
}

function joinPathFromUrl(urlPath) {
  const cleaned = String(urlPath || '').replace(/^\//, '');
  return path.join(process.cwd(), ...cleaned.split('/'));
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writePdfToFile(buildDoc, filePath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    stream.on('finish', resolve);
    stream.on('error', reject);
    doc.pipe(stream);
    try {
      buildDoc(doc);
      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}

function addTable(doc, title, headers, rows) {
  doc.moveDown(0.5);
  doc.fontSize(12).fillColor('#111').text(title, { underline: true });
  doc.moveDown(0.3);

  const startX = doc.page.margins.left;
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  // Simple fixed layout: last column right-aligned; others share remaining width
  const amountColWidth = 110;
  const remaining = pageWidth - amountColWidth;
  const colWidth = remaining / Math.max(1, headers.length - 1);

  const headerY = doc.y;
  doc.fontSize(10).fillColor('#444');
  headers.forEach((h, idx) => {
    const x = startX + (idx === headers.length - 1 ? remaining : idx * colWidth);
    doc.text(h, x, headerY, {
      width: idx === headers.length - 1 ? amountColWidth : colWidth,
      align: idx === headers.length - 1 ? 'right' : 'left',
    });
  });
  doc.moveDown(0.6);
  doc.moveTo(startX, doc.y).lineTo(startX + pageWidth, doc.y).strokeColor('#ddd').stroke();
  doc.moveDown(0.4);

  doc.fontSize(10).fillColor('#111');
  rows.forEach((r) => {
    const rowY = doc.y;
    r.forEach((cell, idx) => {
      const x = startX + (idx === r.length - 1 ? remaining : idx * colWidth);
      doc.text(String(cell ?? ''), x, rowY, {
        width: idx === r.length - 1 ? amountColWidth : colWidth,
        align: idx === r.length - 1 ? 'right' : 'left',
      });
    });
    doc.moveDown(0.6);
  });
}

function fmtDate(d) {
  try {
    return new Date(d || Date.now()).toLocaleDateString();
  } catch {
    return '';
  }
}

function cleanStr(v) {
  return String(v ?? '').trim();
}

function categoryLabel(category) {
  const c = cleanStr(category).toLowerCase();
  const map = {
    road: 'Road',
    drainage: 'Drainage',
    electricity: 'Electricity',
    garbage: 'Garbage',
    water: 'Water',
    streetlight: 'Street Light',
    parks: 'Parks',
    other: 'Other',
  };
  return map[c] || (c ? c[0].toUpperCase() + c.slice(1) : 'Other');
}

function timelineTerm(complaint) {
  const deadline = complaint?.deadline;
  if (deadline) return `Execution : To be completed on or before ${fmtDate(deadline)}.`;
  const p = cleanStr(complaint?.priority).toLowerCase();
  switch (p) {
    case 'urgent':
      return 'Execution : Within 7 days from the date of P.O/approval (subject to site readiness).';
    case 'high':
      return 'Execution : Within 15 days from the date of P.O/approval (subject to site readiness).';
    case 'low':
      return 'Execution : Within 40-60 days from the date of P.O/approval (subject to site readiness).';
    case 'medium':
    default:
      return 'Execution : Within 20-30 days from the date of P.O/approval (subject to site readiness).';
  }
}

function warrantyTerm(category) {
  const c = cleanStr(category).toLowerCase();
  if (c === 'garbage') return 'Service Period : As per agreed schedule/contract.';
  if (c === 'water') return 'Warranty Period : 3 months (as applicable).';
  if (c === 'road' || c === 'drainage') return 'Warranty Period : 6 months (as applicable).';
  if (c === 'electricity' || c === 'streetlight') return 'Warranty Period : 1 year (as applicable).';
  if (c === 'parks') return 'Warranty Period : 3 months for planting/survival (as applicable).';
  return 'Warranty Period : 1 year (as applicable).';
}

function getTermsForComplaint(complaint) {
  const c = cleanStr(complaint?.category).toLowerCase();
  const base = [
    'GST as applicable.',
    timelineTerm(complaint),
    'Payment : 60% advance, remaining 40% at the time of completion/delivery.',
    'Packing, Forwarding & Transportation : As applicable / extra if required.',
    'Validity-Offer Valid for 15 days only.',
    'Rates : Negotiable @ the time of P.O/approval.',
    warrantyTerm(c),
    'Scope : Limited to the complaint location and described work; additional work requires written approval.',
  ];

  const extraByCategory = {
    road: [
      'Safety : Barricading/traffic diversion and public safety measures will be maintained during execution.',
      'Quality : Work shall be carried out as per municipal/IRC specifications and standard practices.',
    ],
    drainage: [
      'Safety : Proper dewatering/shoring will be done where required to avoid hazards/collapse.',
      'Disposal : Silt/debris will be removed and disposed at an approved location as per rules.',
    ],
    electricity: [
      'Approval : Work is subject to power shutdown/department permissions wherever required.',
      'Testing : Testing and commissioning will be carried out after completion (as applicable).',
    ],
    streetlight: [
      'Approval : Work is subject to power shutdown/department permissions wherever required.',
      'Testing : Testing and commissioning of street lights will be carried out after completion (as applicable).',
    ],
    water: [
      'Approval : Work is subject to water shutdown schedule/department permissions wherever required.',
      'Testing : Leak/pressure testing and flushing will be done after completion (as applicable).',
    ],
    garbage: [
      'Compliance : Collection/transport/disposal will be as per municipal solid waste rules.',
      'Segregation : Segregation and safe handling will be followed as applicable.',
    ],
    parks: [
      'Maintenance : Basic maintenance/watering is included only if mentioned in the scope/BOQ.',
      'Protection : Site protection and cleanup will be maintained during execution.',
    ],
  };

  const extra = extraByCategory[c] || [];
  return [...base, ...extra];
}

function toLineItems(quotation) {
  const items = [];
  const labor = Array.isArray(quotation?.labor) ? quotation.labor : [];
  const material = Array.isArray(quotation?.material) ? quotation.material : [];
  const other = Array.isArray(quotation?.other) ? quotation.other : [];

  if (labor.length) {
    items.push({ kind: 'section', name: 'LABOR' });
    labor.forEach((i) => {
      const nameParts = [cleanStr(i.employee), cleanStr(i.type)].filter(Boolean);
      items.push({
        kind: 'item',
        name: nameParts.join(' - ') || 'Labor',
        qty: round2(i.hours),
        rate: round2(i.rate),
        amount: round2(i.amount),
      });
    });
  }

  if (material.length) {
    items.push({ kind: 'section', name: 'MATERIAL' });
    material.forEach((i) => {
      items.push({
        kind: 'item',
        name: cleanStr(i.description) || 'Material',
        qty: round2(i.quantity),
        rate: round2(i.unitPrice),
        amount: round2(i.amount),
      });
    });
  }

  if (other.length) {
    items.push({ kind: 'section', name: 'OTHER' });
    other.forEach((i) => {
      items.push({
        kind: 'item',
        name: cleanStr(i.description) || 'Other',
        qty: round2(i.quantity),
        rate: round2(i.unitPrice),
        amount: round2(i.amount),
      });
    });
  }

  return items;
}

function drawOuterBorder(doc, margin) {
  const w = doc.page.width - margin * 2;
  const h = doc.page.height - margin * 2;
  doc.save();
  doc.lineWidth(1).strokeColor('#000').rect(margin, margin, w, h).stroke();
  doc.restore();
}

function drawBox(doc, x, y, w, h, opts = {}) {
  const { stroke = '#000', lineWidth = 1 } = opts;
  doc.save();
  doc.lineWidth(lineWidth).strokeColor(stroke).rect(x, y, w, h).stroke();
  doc.restore();
}

function drawHLine(doc, x1, x2, y, color = '#000') {
  doc.save();
  doc.strokeColor(color).moveTo(x1, y).lineTo(x2, y).stroke();
  doc.restore();
}

function drawVLine(doc, x, y1, y2, color = '#000') {
  doc.save();
  doc.strokeColor(color).moveTo(x, y1).lineTo(x, y2).stroke();
  doc.restore();
}

function drawWrappedText(doc, text, x, y, w, h, opts = {}) {
  const { fontSize = 9, bold = false, color = '#111', align = 'left' } = opts;
  doc.save();
  doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(fontSize).fillColor(color);
  doc.text(cleanStr(text), x, y, { width: w, height: h, align });
  doc.restore();
}

function drawQuotationHeader(doc, ctx, layout) {
  const { margin, contentX, contentW } = layout;
  const topY = margin;

  // Title
  doc.font('Helvetica-Bold').fontSize(14).fillColor('#111').text('QUOTATION', contentX, topY + 8, {
    width: contentW,
    align: 'center',
  });
  drawHLine(doc, contentX + contentW * 0.42, contentX + contentW * 0.58, topY + 28);

  // Vendor + Quote Meta box
  const boxY = topY + 34;
  const boxH = 78;
  drawBox(doc, contentX, boxY, contentW, boxH);
  const leftW = Math.round(contentW * 0.62);
  const rightW = contentW - leftW;
  drawVLine(doc, contentX + leftW, boxY, boxY + boxH);
  // Right side split into 2 rows
  const midY = boxY + Math.round(boxH / 2);
  drawHLine(doc, contentX + leftW, contentX + contentW, midY);

  // Left: contractor company
  const vendorName = ctx.contractorName;
  drawWrappedText(doc, vendorName, contentX + 8, boxY + 8, leftW - 16, 16, {
    fontSize: 11,
    bold: true,
    color: '#b91c1c',
  });
  drawWrappedText(
    doc,
    `Address: ${ctx.contractorAddress || '-'}`,
    contentX + 8,
    boxY + 26,
    leftW - 16,
    16,
    { fontSize: 9 }
  );
  drawWrappedText(
    doc,
    `Contact: ${ctx.contractorPhone || '-'}`,
    contentX + 8,
    boxY + 42,
    leftW - 16,
    16,
    { fontSize: 9 }
  );
  drawWrappedText(
    doc,
    `Email: ${ctx.contractorEmail || '-'}`,
    contentX + 8,
    boxY + 58,
    leftW - 16,
    16,
    { fontSize: 9 }
  );

  // Right: quotation no / date
  drawWrappedText(doc, `QUOTATION NO\n${ctx.quotationNumber}`, contentX + leftW + 8, boxY + 8, rightW - 16, 30, {
    fontSize: 9,
    bold: true,
    align: 'center',
  });
  drawWrappedText(doc, `Date: ${ctx.quotationDate}`, contentX + leftW + 8, midY + 10, rightW - 16, 16, {
    fontSize: 9,
    bold: true,
    align: 'center',
  });

  // To / Subject box
  const toY = boxY + boxH;
  const toH = 62;
  drawBox(doc, contentX, toY, contentW, toH);
  const leftToW = Math.round(contentW * 0.28);
  drawVLine(doc, contentX + leftToW, toY, toY + toH);
  drawWrappedText(doc, 'To,', contentX + 8, toY + 8, leftToW - 16, 16, { fontSize: 9, bold: true });
  drawWrappedText(
    doc,
    ctx.toLine1,
    contentX + leftToW + 8,
    toY + 8,
    contentW - leftToW - 16,
    16,
    { fontSize: 9 }
  );
  drawWrappedText(
    doc,
    ctx.toLine2,
    contentX + leftToW + 8,
    toY + 24,
    contentW - leftToW - 16,
    16,
    { fontSize: 9 }
  );
  drawWrappedText(
    doc,
    `Sub: ${ctx.subject}`,
    contentX + 8,
    toY + 40,
    contentW - 16,
    16,
    { fontSize: 9, bold: true }
  );

  // Section title bar
  const secY = toY + toH;
  const secH = 34;
  drawBox(doc, contentX, secY, contentW, secH);
  drawWrappedText(doc, ctx.heading, contentX, secY + 6, contentW, 16, {
    fontSize: 10,
    bold: true,
    align: 'center',
  });
  drawWrappedText(doc, 'LIST OF TOOLS & EQUIPMENTS', contentX, secY + 20, contentW, 14, {
    fontSize: 8.5,
    bold: true,
    align: 'center',
  });

  return secY + secH;
}

function drawItemsTable(doc, items, layout) {
  const { contentX, contentW, margin, bottomY } = layout;

  const col = {
    sr: 34,
    name: Math.round(contentW * 0.54),
    qty: 56,
    rate: 78,
    amount: contentW - 34 - Math.round(contentW * 0.54) - 56 - 78,
  };

  const tableX = contentX;
  let y = doc.y;

  const rowPad = 4;
  const headerH = 22;

  const drawTableHeader = () => {
    drawBox(doc, tableX, y, contentW, headerH);
    // column lines
    const x1 = tableX + col.sr;
    const x2 = x1 + col.name;
    const x3 = x2 + col.qty;
    const x4 = x3 + col.rate;
    [x1, x2, x3, x4].forEach((vx) => drawVLine(doc, vx, y, y + headerH));
    drawWrappedText(doc, 'SR', tableX, y + 6, col.sr, 12, { fontSize: 9, bold: true, align: 'center' });
    drawWrappedText(doc, 'Name of the Tools and Equipment', tableX + col.sr + 4, y + 6, col.name - 8, 12, {
      fontSize: 9,
      bold: true,
    });
    drawWrappedText(doc, 'Qty', tableX + col.sr + col.name, y + 6, col.qty, 12, {
      fontSize: 9,
      bold: true,
      align: 'center',
    });
    drawWrappedText(doc, 'Rate', tableX + col.sr + col.name + col.qty, y + 6, col.rate, 12, {
      fontSize: 9,
      bold: true,
      align: 'center',
    });
    drawWrappedText(doc, 'Amount', tableX + col.sr + col.name + col.qty + col.rate, y + 6, col.amount, 12, {
      fontSize: 9,
      bold: true,
      align: 'center',
    });
    y += headerH;
  };

  const ensureSpace = (h) => {
    if (y + h <= bottomY) return;
    doc.addPage();
    drawOuterBorder(doc, margin);
    // For subsequent pages, we don't re-render full header; just a small title.
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#111').text('QUOTATION', contentX, margin + 8, {
      width: contentW,
      align: 'center',
    });
    drawHLine(doc, contentX + contentW * 0.42, contentX + contentW * 0.58, margin + 28);
    y = margin + 40;
    drawTableHeader();
  };

  drawTableHeader();

  let sr = 1;
  items.forEach((it) => {
    if (it.kind === 'section') {
      const h = 20;
      ensureSpace(h);
      drawBox(doc, tableX, y, contentW, h);
      drawWrappedText(doc, it.name, tableX + 6, y + 5, contentW - 12, 12, { fontSize: 9, bold: true });
      y += h;
      return;
    }

    // compute height by wrapping the name cell
    doc.save();
    doc.font('Helvetica').fontSize(9);
    const nameH = doc.heightOfString(cleanStr(it.name), { width: col.name - 8 });
    doc.restore();
    const h = Math.max(20, Math.ceil(nameH) + rowPad * 2);
    ensureSpace(h);

    drawBox(doc, tableX, y, contentW, h);
    const x1 = tableX + col.sr;
    const x2 = x1 + col.name;
    const x3 = x2 + col.qty;
    const x4 = x3 + col.rate;
    [x1, x2, x3, x4].forEach((vx) => drawVLine(doc, vx, y, y + h));

    drawWrappedText(doc, String(sr), tableX, y + rowPad, col.sr, h - rowPad * 2, {
      fontSize: 9,
      align: 'center',
    });
    drawWrappedText(doc, it.name, tableX + col.sr + 4, y + rowPad, col.name - 8, h - rowPad * 2, {
      fontSize: 9,
    });
    drawWrappedText(doc, String(round2(it.qty)), tableX + col.sr + col.name, y + rowPad, col.qty, h - rowPad * 2, {
      fontSize: 9,
      align: 'center',
    });
    drawWrappedText(
      doc,
      String(round2(it.rate)),
      tableX + col.sr + col.name + col.qty,
      y + rowPad,
      col.rate,
      h - rowPad * 2,
      { fontSize: 9, align: 'center' }
    );
    drawWrappedText(
      doc,
      String(round2(it.amount)),
      tableX + col.sr + col.name + col.qty + col.rate,
      y + rowPad,
      col.amount,
      h - rowPad * 2,
      { fontSize: 9, align: 'center' }
    );

    y += h;
    sr += 1;
  });

  doc.y = y;
}

function drawTotalsTermsAndSignature(doc, ctx, layout) {
  const { contentX, contentW, margin, bottomY } = layout;
  const tableX = contentX;

  const ensureSpace = (h) => {
    if (doc.y + h <= bottomY) return;
    doc.addPage();
    drawOuterBorder(doc, margin);
    doc.y = margin + 40;
  };

  // Total row (right aligned like sample)
  ensureSpace(60);
  doc.moveDown(0.3);
  const rightBoxW = Math.round(contentW * 0.38);
  const rightX = tableX + contentW - rightBoxW;
  const rowH = 22;
  drawBox(doc, rightX, doc.y, rightBoxW, rowH);
  drawVLine(doc, rightX + Math.round(rightBoxW * 0.55), doc.y, doc.y + rowH);
  drawWrappedText(doc, 'Total', rightX + 6, doc.y + 6, Math.round(rightBoxW * 0.55) - 12, 12, {
    fontSize: 10,
    bold: true,
  });
  drawWrappedText(doc, String(round2(ctx.totalAmount)), rightX + Math.round(rightBoxW * 0.55), doc.y + 6, rightBoxW - Math.round(rightBoxW * 0.55), 12, {
    fontSize: 10,
    bold: true,
    color: '#b91c1c',
    align: 'center',
  });
  doc.y += rowH + 10;

  // Terms (dynamic based on complaint category/priority/deadline)
  const terms = Array.isArray(ctx.terms) && ctx.terms.length ? ctx.terms : ['GST as applicable.'];

  ensureSpace(140);
  drawWrappedText(doc, 'Terms & Conditions :', contentX + 4, doc.y, contentW - 8, 14, {
    fontSize: 9,
    bold: true,
  });
  doc.y += 14;
  doc.font('Helvetica').fontSize(8.5).fillColor('#111');
  terms.forEach((t, i) => {
    ensureSpace(14);
    doc.text(`${i + 1}) ${t}`, contentX + 10, doc.y, { width: contentW - 20 });
    doc.y += 12;
  });

  // Signature
  ensureSpace(120);
  doc.y += 8;
  const sigBoxW = Math.round(contentW * 0.45);
  const sigX = contentX + contentW - sigBoxW;
  drawWrappedText(doc, 'Yours faithfully', sigX, doc.y, sigBoxW, 12, { fontSize: 9, align: 'right' });
  doc.y += 14;

  const signaturePath = ctx.contractorSignaturePath;
  if (signaturePath && fs.existsSync(signaturePath)) {
    try {
      const imgW = 160;
      const imgH = 60;
      const imgX = contentX + contentW - imgW - 10;
      const imgY = doc.y;
      doc.image(signaturePath, imgX, imgY, { width: imgW, height: imgH, fit: [imgW, imgH] });
      doc.y += imgH + 6;
    } catch {
      // ignore image errors
    }
  } else {
    // blank line
    drawHLine(doc, contentX + contentW - sigBoxW, contentX + contentW, doc.y + 18, '#555');
    doc.y += 26;
  }

  drawWrappedText(doc, `For ${ctx.contractorName}`, sigX, doc.y, sigBoxW, 12, {
    fontSize: 9,
    bold: true,
    align: 'right',
  });
}

/**
 * Generates a quotation PDF into backend/uploads/quotations and returns `{ pdfUrl, filePath }`.
 * Expects `quotation` to have totals + line items; accepts populated refs for better headers.
 */
export async function generateQuotationPdf({
  quotation,
  complaint,
  contractor,
  municipalOffice,
}) {
  const uploadsDir = path.join(process.cwd(), 'uploads', 'quotations');
  ensureDir(uploadsDir);

  const fileName = `${safeFilePart(quotation?.quotationNumber)}-${quotation?._id}.pdf`;
  const pdfUrl = `/uploads/quotations/${fileName}`;
  const filePath = joinPathFromUrl(pdfUrl);

  await writePdfToFile((doc) => {
    const margin = 26;
    const contentX = margin;
    const contentW = doc.page.width - margin * 2;
    const bottomY = doc.page.height - margin - 24;

    const contractorName =
      contractor?.contractorInfo?.companyName || contractor?.name || 'Contractor';
    const contractorEmail = contractor?.email || '';
    const contractorPhone = contractor?.phone || '';
    const contractorAddress = contractor?.contractorInfo?.address || '';

    const officeName = municipalOffice?.name || 'Municipal Office';
    const officeAddress = municipalOffice?.address || complaint?.location?.address || '';

    const quotationNumber = quotation?.quotationNumber || '';
    const quotationDate = fmtDate(quotation?.createdAt);
    const complaintCategoryLabel = categoryLabel(complaint?.category);

    const ctx = {
      contractorName,
      contractorEmail,
      contractorPhone,
      contractorAddress,
      quotationNumber,
      quotationDate,
      toLine1: officeName,
      toLine2: officeAddress ? `Address: ${officeAddress}` : '',
      subject: `${complaintCategoryLabel} Complaint`,
      heading: cleanStr(quotation?.workDescription) || 'Work Quotation',
      totalAmount: toNum(quotation?.total),
      terms: getTermsForComplaint(complaint),
      contractorSignaturePath: quotation?.contractorSignatureUrl
        ? joinPathFromUrl(quotation.contractorSignatureUrl)
        : '',
    };

    drawOuterBorder(doc, margin);
    const afterHeaderY = drawQuotationHeader(doc, ctx, { margin, contentX, contentW });

    // move cursor to table start
    doc.y = afterHeaderY + 12;

    const items = toLineItems(quotation);
    drawItemsTable(doc, items, { margin, contentX, contentW, bottomY });

    drawTotalsTermsAndSignature(doc, ctx, { margin, contentX, contentW, bottomY });
  }, filePath);

  return { pdfUrl, filePath };
}


