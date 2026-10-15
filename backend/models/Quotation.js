import mongoose from 'mongoose';

const laborItemSchema = new mongoose.Schema(
  {
    employee: { type: String, trim: true },
    type: { type: String, trim: true },
    hours: { type: Number, min: 0, default: 0 },
    rate: { type: Number, min: 0, default: 0 },
    amount: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const materialItemSchema = new mongoose.Schema(
  {
    description: { type: String, trim: true },
    quantity: { type: Number, min: 0, default: 0 },
    unitPrice: { type: Number, min: 0, default: 0 },
    amount: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const otherItemSchema = new mongoose.Schema(
  {
    description: { type: String, trim: true },
    quantity: { type: Number, min: 0, default: 0 },
    unitPrice: { type: Number, min: 0, default: 0 },
    amount: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const quotationSchema = new mongoose.Schema(
  {
    quotationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
      index: true,
    },
    contractor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    municipalOffice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MunicipalOffice',
      required: true,
      index: true,
    },

    workDescription: {
      type: String,
      required: true,
      trim: true,
    },

    labor: { type: [laborItemSchema], default: [] },
    material: { type: [materialItemSchema], default: [] },
    other: { type: [otherItemSchema], default: [] },

    subtotal: { type: Number, min: 0, default: 0 },
    taxRate: { type: Number, min: 0, default: 0 },
    taxAmount: { type: Number, min: 0, default: 0 },
    total: { type: Number, min: 0, default: 0 },

    pdfUrl: { type: String, trim: true },
    contractorSignatureUrl: { type: String, trim: true, default: '' },

    status: {
      type: String,
      enum: ['submitted', 'approved', 'rejected'],
      default: 'submitted',
      index: true,
    },
    submittedAt: { type: Date, default: Date.now, index: true },

    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    rejectionReason: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

quotationSchema.index({ complaint: 1, contractor: 1 }, { unique: true });

function toNumber(n) {
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
}

function round2(n) {
  return Math.round(toNumber(n) * 100) / 100;
}

quotationSchema.pre('validate', function (next) {
  // Generate quotation number if missing
  if (!this.quotationNumber) {
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    this.quotationNumber = `QTN-${Date.now()}-${rand}`;
  }

  // Normalize line item amounts if missing
  if (Array.isArray(this.labor)) {
    this.labor = this.labor.map((i) => {
      const hours = toNumber(i.hours);
      const rate = toNumber(i.rate);
      const amount = i.amount != null ? toNumber(i.amount) : hours * rate;
      return { ...i, hours, rate, amount: round2(amount) };
    });
  }

  const normalizeQtyPrice = (arr) =>
    Array.isArray(arr)
      ? arr.map((i) => {
          const quantity = toNumber(i.quantity);
          const unitPrice = toNumber(i.unitPrice);
          const amount = i.amount != null ? toNumber(i.amount) : quantity * unitPrice;
          return { ...i, quantity, unitPrice, amount: round2(amount) };
        })
      : [];

  this.material = normalizeQtyPrice(this.material);
  this.other = normalizeQtyPrice(this.other);

  const laborTotal = (this.labor || []).reduce((sum, i) => sum + toNumber(i.amount), 0);
  const materialTotal = (this.material || []).reduce((sum, i) => sum + toNumber(i.amount), 0);
  const otherTotal = (this.other || []).reduce((sum, i) => sum + toNumber(i.amount), 0);
  const computedSubtotal = round2(laborTotal + materialTotal + otherTotal);

  // If caller didn't set subtotal, compute it.
  if (this.subtotal == null || this.subtotal === 0) {
    this.subtotal = computedSubtotal;
  } else {
    this.subtotal = round2(this.subtotal);
  }

  this.taxRate = toNumber(this.taxRate);
  this.taxAmount = round2((this.subtotal * this.taxRate) / 100);
  this.total = round2(this.subtotal + this.taxAmount);

  if (this.status === 'submitted' && !this.submittedAt) {
    this.submittedAt = new Date();
  }

  next();
});

const Quotation = mongoose.model('Quotation', quotationSchema);

export default Quotation;
