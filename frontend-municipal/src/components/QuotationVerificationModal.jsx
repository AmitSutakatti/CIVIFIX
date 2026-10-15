import { useState } from 'react';
import { X, Check, XCircle, Download } from 'lucide-react';
import { quotationAPI } from '../services/api';
import toast from 'react-hot-toast';

const QuotationVerificationModal = ({ quotation, onClose, onSuccess }) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      await quotationAPI.approve(quotation._id);
      toast.success('Quotation approved successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error approving quotation:', error);
      toast.error(error.response?.data?.message || 'Error approving quotation');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setLoading(true);
    try {
      await quotationAPI.reject(quotation._id, rejectionReason);
      toast.success('Quotation rejected successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error rejecting quotation:', error);
      toast.error(error.response?.data?.message || 'Error rejecting quotation');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (quotation.pdfUrl) {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const origin = apiBase.replace(/\/api\/?$/, '');
      const pdfUrl = quotation.pdfUrl.startsWith('http')
        ? quotation.pdfUrl.replace('8001', '8000')
        : `${origin}${quotation.pdfUrl}`;
      window.open(pdfUrl, '_blank');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Quotation Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Quotation Number</label>
              <p className="text-gray-900 font-medium">{quotation.quotationNumber}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(quotation.status)}`}>
                {quotation.status.toUpperCase()}
              </span>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Date</label>
              <p className="text-gray-900">
                {new Date(quotation.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Contractor</label>
              <p className="text-gray-900">
                {quotation.contractor?.contractorInfo?.companyName || quotation.contractor?.name}
              </p>
            </div>
          </div>

          {/* Complaint Info */}
          <div>
            <label className="text-sm font-medium text-gray-500">Complaint</label>
            <p className="text-gray-900">{quotation.complaint?.description}</p>
          </div>

          {/* Work Description */}
          <div>
            <label className="text-sm font-medium text-gray-500">Work Description</label>
            <p className="text-gray-900">{quotation.workDescription}</p>
          </div>

          {/* Labor Section */}
          {quotation.labor && quotation.labor.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-500 mb-2 block">LABOR</label>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Employee</th>
                      <th className="px-3 py-2 text-left">Type</th>
                      <th className="px-3 py-2 text-right">Hours</th>
                      <th className="px-3 py-2 text-right">Rate</th>
                      <th className="px-3 py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotation.labor.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-3 py-2">{item.employee}</td>
                        <td className="px-3 py-2">{item.type}</td>
                        <td className="px-3 py-2 text-right">{item.hours.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right">Rs.{item.rate.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right">Rs.{item.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="font-medium bg-gray-50">
                      <td colSpan="4" className="px-3 py-2 text-right">Total (LABOR):</td>
                      <td className="px-3 py-2 text-right">
                        Rs.{quotation.labor.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Material Section */}
          {quotation.material && quotation.material.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-500 mb-2 block">MATERIAL</label>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Description</th>
                      <th className="px-3 py-2 text-right">Quantity</th>
                      <th className="px-3 py-2 text-right">Unit Price</th>
                      <th className="px-3 py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotation.material.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-3 py-2">{item.description}</td>
                        <td className="px-3 py-2 text-right">{item.quantity.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right">Rs.{item.unitPrice.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right">Rs.{item.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="font-medium bg-gray-50">
                      <td colSpan="3" className="px-3 py-2 text-right">Total (MATERIAL):</td>
                      <td className="px-3 py-2 text-right">
                        Rs.{quotation.material.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Other Section */}
          {quotation.other && quotation.other.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-500 mb-2 block">OTHER</label>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Description</th>
                      <th className="px-3 py-2 text-right">Quantity</th>
                      <th className="px-3 py-2 text-right">Unit Price</th>
                      <th className="px-3 py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotation.other.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-3 py-2">{item.description}</td>
                        <td className="px-3 py-2 text-right">{item.quantity.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right">Rs.{item.unitPrice.toFixed(2)}</td>
                        <td className="px-3 py-2 text-right">Rs.{item.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="font-medium bg-gray-50">
                      <td colSpan="3" className="px-3 py-2 text-right">Total (OTHER):</td>
                      <td className="px-3 py-2 text-right">
                        Rs.{quotation.other.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Subtotal:</span>
              <span className="font-medium">Rs.{quotation.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Tax ({quotation.taxRate}%):</span>
              <span>Rs.{quotation.taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-300">
              <span className="font-bold text-lg">Total:</span>
              <span className="font-bold text-lg">Rs.{quotation.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Rejection Reason (if rejected) */}
          {quotation.status === 'rejected' && quotation.rejectionReason && (
            <div>
              <label className="text-sm font-medium text-gray-500">Rejection Reason</label>
              <p className="text-gray-900">{quotation.rejectionReason}</p>
            </div>
          )}

          {/* Actions */}
          {quotation.status === 'submitted' && (
            <div className="space-y-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason (if rejecting)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Enter reason for rejection..."
                />
              </div>
              <div className="flex items-center justify-end space-x-3">
                {quotation.pdfUrl && (
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>
                )}
                <button
                  onClick={handleReject}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject</span>
                </button>
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve</span>
                </button>
              </div>
            </div>
          )}

          {quotation.status !== 'submitted' && quotation.pdfUrl && (
            <div className="flex items-center justify-end pt-4 border-t">
              <button
                onClick={handleDownloadPDF}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuotationVerificationModal;







