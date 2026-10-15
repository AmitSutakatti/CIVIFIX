import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { X, Plus, Trash2, Send } from 'lucide-react';
import api from '../services/api';

const emptyLabor = { employee: '', type: '', hours: 0, rate: 0 };
const emptyItem = { description: '', quantity: 0, unitPrice: 0 };

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function round2(n) {
  return Math.round(toNum(n) * 100) / 100;
}

const QuotationModal = ({ complaint, onClose, onSuccess }) => {
  const [workDescription, setWorkDescription] = useState('');
  const [taxRate, setTaxRate] = useState(0);
  const [labor, setLabor] = useState([emptyLabor]);
  const [material, setMaterial] = useState([emptyItem]);
  const [other, setOther] = useState([]);
  const [contractorSignature, setContractorSignature] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const computed = useMemo(() => {
    const laborWithAmount = labor
      .filter((i) => i.employee || i.type || toNum(i.hours) || toNum(i.rate))
      .map((i) => ({
        ...i,
        hours: toNum(i.hours),
        rate: toNum(i.rate),
        amount: round2(toNum(i.hours) * toNum(i.rate)),
      }));

    const mapQty = (arr) =>
      arr
        .filter((i) => i.description || toNum(i.quantity) || toNum(i.unitPrice))
        .map((i) => ({
          ...i,
          quantity: toNum(i.quantity),
          unitPrice: toNum(i.unitPrice),
          amount: round2(toNum(i.quantity) * toNum(i.unitPrice)),
        }));

    const materialWithAmount = mapQty(material);
    const otherWithAmount = mapQty(other);

    const subtotal = round2(
      [...laborWithAmount, ...materialWithAmount, ...otherWithAmount].reduce((s, i) => s + toNum(i.amount), 0)
    );
    const tRate = toNum(taxRate);
    const taxAmount = round2((subtotal * tRate) / 100);
    const total = round2(subtotal + taxAmount);

    return { laborWithAmount, materialWithAmount, otherWithAmount, subtotal, taxAmount, total, taxRate: tRate };
  }, [labor, material, other, taxRate]);

  const updateRow = (setter, idx, patch) => {
    setter((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };

  const removeRow = (setter, idx) => {
    setter((prev) => prev.filter((_, i) => i !== idx));
  };

  const addRow = (setter, row) => {
    setter((prev) => [...prev, row]);
  };

  const handleSubmit = async () => {
    if (!workDescription.trim()) {
      toast.error('Work description is required');
      return;
    }

    if (computed.subtotal <= 0) {
      toast.error('Please add at least one line item with a non-zero amount');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('complaintId', complaint._id);
      formData.append('workDescription', workDescription.trim());
      formData.append('labor', JSON.stringify(computed.laborWithAmount));
      formData.append('material', JSON.stringify(computed.materialWithAmount));
      formData.append('other', JSON.stringify(computed.otherWithAmount));
      formData.append('taxRate', String(computed.taxRate));
      if (contractorSignature) formData.append('contractorSignature', contractorSignature);

      const response = await api.post('/quotation', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Quotation submitted successfully');
      const created = response?.data?.data?.quotation;
      const pdfUrl = created?.pdfUrl;
      if (pdfUrl) {
        const base = (api?.defaults?.baseURL || 'http://localhost:8001/api').replace(/\/api\/?$/, '');
        const finalUrl = pdfUrl.startsWith('http') ? pdfUrl : `${base}${pdfUrl}`;
        window.open(finalUrl, '_blank');
      }
      onSuccess?.();
      onClose?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit quotation');
      // eslint-disable-next-line no-console
      console.error('Quotation submit error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Generate Quotation</h3>
            <p className="text-sm text-gray-500 mt-1">
              Project #{complaint?._id?.toString?.().slice?.(-6)} • {complaint?.category}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Work Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Work Description</label>
          <textarea
            value={workDescription}
            onChange={(e) => setWorkDescription(e.target.value)}
            className="input-field w-full resize-none"
            rows="3"
            placeholder="Describe the work to be done..."
          />
        </div>

        {/* Contractor Signature */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Contractor Signature (Image)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setContractorSignature(file);
              if (signaturePreview) URL.revokeObjectURL(signaturePreview);
              setSignaturePreview(file ? URL.createObjectURL(file) : '');
            }}
            className="block w-full text-sm text-gray-700"
          />
          {signaturePreview && (
            <div className="mt-3 flex items-center justify-between gap-4">
              <img
                src={signaturePreview}
                alt="Signature preview"
                className="h-16 object-contain border rounded bg-white p-2"
              />
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  if (signaturePreview) URL.revokeObjectURL(signaturePreview);
                  setSignaturePreview('');
                  setContractorSignature(null);
                }}
              >
                Remove
              </button>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">This signature will be printed in the generated quotation PDF.</p>
        </div>

        {/* LABOR */}
        <Section
          title="LABOR"
          onAdd={() => addRow(setLabor, emptyLabor)}
        >
          <Table
            headers={['Employee', 'Type', 'Hours', 'Rate', 'Amount', '']}
          >
            {labor.map((row, idx) => {
              const amount = round2(toNum(row.hours) * toNum(row.rate));
              return (
                <tr key={idx} className="border-b">
                  <td className="px-3 py-2">
                    <input
                      value={row.employee}
                      onChange={(e) => updateRow(setLabor, idx, { employee: e.target.value })}
                      className="input-field"
                      placeholder="Worker"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      value={row.type}
                      onChange={(e) => updateRow(setLabor, idx, { type: e.target.value })}
                      className="input-field"
                      placeholder="Skill"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.25"
                      value={row.hours}
                      onChange={(e) => updateRow(setLabor, idx, { hours: e.target.value })}
                      className="input-field"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.rate}
                      onChange={(e) => updateRow(setLabor, idx, { rate: e.target.value })}
                      className="input-field"
                    />
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-gray-900">
                    Rs.{amount.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => removeRow(setLabor, idx)}
                      className="text-red-600 hover:text-red-800"
                      title="Remove row"
                      type="button"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </Table>
        </Section>

        {/* MATERIAL */}
        <Section
          title="MATERIAL"
          onAdd={() => addRow(setMaterial, emptyItem)}
        >
          <ItemTable
            rows={material}
            setRows={setMaterial}
            rowType="material"
          />
        </Section>

        {/* OTHER */}
        <Section
          title="OTHER"
          onAdd={() => addRow(setOther, emptyItem)}
        >
          <ItemTable rows={other} setRows={setOther} rowType="other" />
        </Section>

        {/* Summary */}
        <div className="bg-gray-50 p-4 rounded-md mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="md:col-span-2">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Subtotal:</span>
                <span className="font-medium">Rs.{computed.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Tax ({computed.taxRate}%):</span>
                <span>Rs.{computed.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-300">
                <span className="font-bold text-lg">Total:</span>
                <span className="font-bold text-lg">Rs.{computed.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t mt-6">
          <button onClick={onClose} className="btn-secondary" type="button">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? 'Submitting...' : 'Submit Quotation'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, children, onAdd }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-500">{title}</label>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">Add</span>
        </button>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
};

const Table = ({ headers, children }) => {
  return (
    <table className="w-full text-sm">
      <thead className="bg-gray-50">
        <tr>
          {headers.map((h) => (
            <th key={h} className={`px-3 py-2 ${h === 'Amount' ? 'text-right' : 'text-left'}`}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
};

const ItemTable = ({ rows, setRows }) => {
  const updateRow = (idx, patch) => setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  const removeRow = (idx) => setRows((prev) => prev.filter((_, i) => i !== idx));

  return (
    <Table headers={['Description', 'Quantity', 'Unit Price', 'Amount', '']}>
      {rows.map((row, idx) => {
        const amount = round2(toNum(row.quantity) * toNum(row.unitPrice));
        return (
          <tr key={idx} className="border-b">
            <td className="px-3 py-2">
              <input
                value={row.description}
                onChange={(e) => updateRow(idx, { description: e.target.value })}
                className="input-field"
                placeholder="Description"
              />
            </td>
            <td className="px-3 py-2">
              <input
                type="number"
                min="0"
                step="0.01"
                value={row.quantity}
                onChange={(e) => updateRow(idx, { quantity: e.target.value })}
                className="input-field"
              />
            </td>
            <td className="px-3 py-2">
              <input
                type="number"
                min="0"
                step="0.01"
                value={row.unitPrice}
                onChange={(e) => updateRow(idx, { unitPrice: e.target.value })}
                className="input-field"
              />
            </td>
            <td className="px-3 py-2 text-right font-medium text-gray-900">
              Rs.{amount.toFixed(2)}
            </td>
            <td className="px-3 py-2 text-right">
              <button
                onClick={() => removeRow(idx)}
                className="text-red-600 hover:text-red-800"
                title="Remove row"
                type="button"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </td>
          </tr>
        );
      })}
    </Table>
  );
};

export default QuotationModal;

