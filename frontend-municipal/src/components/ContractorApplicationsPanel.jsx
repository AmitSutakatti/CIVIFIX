import { useState, useEffect } from 'react';
import { municipalAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  UserCheck,
  UserX,
  CalendarPlus,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

const apiOrigin = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(
  /\/api\/?$/,
  ''
);

const statusBadge = (status) => {
  const map = {
    pending: 'bg-amber-100 text-amber-900 border-amber-200',
    verified: 'bg-blue-100 text-blue-900 border-blue-200',
    rejected: 'bg-red-100 text-red-900 border-red-200',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
};

const ContractorApplicationsPanel = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [verifyAction, setVerifyAction] = useState(null);
  const [note, setNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [appointmentAt, setAppointmentAt] = useState('');
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await municipalAPI.getContractorApplications();
      setApplications(res.data.data.applications || []);
    } catch (e) {
      console.error(e);
      toast.error('Could not load contractor applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const certUrl = (path) => (path ? `${apiOrigin}${path}` : null);

  const submitVerify = async () => {
    if (!selected || !verifyAction) return;
    if (verifyAction === 'reject' && !rejectionReason.trim()) {
      toast.error('Add a rejection reason');
      return;
    }
    setSaving(true);
    try {
      await municipalAPI.verifyContractorApplication(selected._id, {
        action: verifyAction,
        note: note.trim(),
        rejectionReason: rejectionReason.trim(),
      });
      toast.success(
        verifyAction === 'approve'
          ? 'Verified. Schedule an appointment to activate the contractor.'
          : 'Application rejected.'
      );
      setSelected(null);
      setVerifyAction(null);
      setNote('');
      setRejectionReason('');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const submitAppointment = async () => {
    if (!selected || !appointmentAt) {
      toast.error('Choose date and time for the appointment');
      return;
    }
    setSaving(true);
    try {
      const iso = new Date(appointmentAt).toISOString();
      await municipalAPI.scheduleContractorAppointment(selected._id, {
        appointmentAt: iso,
        appointmentNotes: appointmentNotes.trim(),
      });
      toast.success('Appointment saved. Contractor can use the portal.');
      setSelected(null);
      setAppointmentAt('');
      setAppointmentNotes('');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not save appointment');
    } finally {
      setSaving(false);
    }
  };

  if (loading && applications.length === 0) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Review contractor details and certificates, then verify and schedule an in-person
          appointment before they can access the contractor portal.
        </p>
        <button
          type="button"
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-100">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">License</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Submitted</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {applications.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No applications in this queue.
                </td>
              </tr>
            )}
            {applications.map((row) => {
              const cv = row.contractorVerification || {};
              const submitted = cv.submittedAt
                ? new Date(cv.submittedAt).toLocaleString()
                : '—';
              const url = certUrl(cv.degreeCertificatePath);
              return (
                <tr key={row._id} className="hover:bg-gray-50/80">
                  <td className="px-4 py-3 font-medium text-gray-900">{row.name}</td>
                  <td className="px-4 py-3 text-gray-700">{row.email}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {row.contractorInfo?.companyName || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {row.contractorInfo?.licenseNumber || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded border text-xs font-medium ${statusBadge(
                        cv.status
                      )}`}
                    >
                      {cv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{submitted}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {url && (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Certificate
                        </a>
                      )}
                      {cv.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelected(row);
                            setVerifyAction('approve');
                            setNote('');
                            setRejectionReason('');
                          }}
                          className="inline-flex items-center gap-1 text-green-700 hover:underline"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Verify
                        </button>
                      )}
                      {cv.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelected(row);
                            setVerifyAction('reject');
                            setNote('');
                            setRejectionReason('');
                          }}
                          className="inline-flex items-center gap-1 text-red-700 hover:underline"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      )}
                      {cv.status === 'verified' && (
                        <button
                          type="button"
                          onClick={() => {
                            setVerifyAction(null);
                            setSelected(row);
                            setAppointmentAt('');
                            setAppointmentNotes('');
                          }}
                          className="inline-flex items-center gap-1 text-blue-700 hover:underline"
                        >
                          <CalendarPlus className="w-3.5 h-3.5" />
                          Appointment
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected && verifyAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {verifyAction === 'approve' ? 'Approve application' : 'Reject application'}
            </h3>
            <p className="text-sm text-gray-600">
              {selected.name} — {selected.contractorInfo?.companyName}
            </p>
            {verifyAction === 'approve' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note (optional)
                </label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Internal note for colleagues…"
                />
              </div>
            )}
            {verifyAction === 'reject' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason shown to contractor
                </label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  rows={3}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="px-4 py-2 text-sm border rounded-lg"
                onClick={() => {
                  setSelected(null);
                  setVerifyAction(null);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                className={`px-4 py-2 text-sm rounded-lg text-white ${
                  verifyAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
                onClick={submitVerify}
              >
                {saving ? 'Saving…' : verifyAction === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selected && !verifyAction && selected.contractorVerification?.status === 'verified' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Schedule in-person appointment</h3>
            <p className="text-sm text-gray-600">
              This activates the contractor account after you confirm the meeting time.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date and time
              </label>
              <input
                type="datetime-local"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={appointmentAt}
                onChange={(e) => setAppointmentAt(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructions (optional)
              </label>
              <textarea
                className="w-full border rounded-lg px-3 py-2 text-sm"
                rows={2}
                value={appointmentNotes}
                onChange={(e) => setAppointmentNotes(e.target.value)}
                placeholder="Office location, documents to bring…"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                className="px-4 py-2 text-sm border rounded-lg"
                onClick={() => setSelected(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                className="px-4 py-2 text-sm rounded-lg text-white bg-blue-600 hover:bg-blue-700"
                onClick={submitAppointment}
              >
                {saving ? 'Saving…' : 'Save & activate contractor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractorApplicationsPanel;
