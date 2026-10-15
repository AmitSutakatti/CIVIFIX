import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  AlertTriangle,
  Check,
  CheckCircle,
  MapPin,
  UserPlus,
  XCircle,
} from 'lucide-react';
import { municipalAPI } from '../services/api';

const API_HOST = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(
  /\/api\/?$/,
  ''
);

const FAKE_REASONS = [
  { id: 'fabricated_issue', label: 'Fabricated issue' },
  { id: 'misleading_information', label: 'Misleading information' },
  { id: 'unrelated_photo', label: 'Misleading / unrelated photo' },
  { id: 'incorrect_location', label: 'Incorrect location' },
  { id: 'other', label: 'Other' },
];

const imageSrc = (url) => (url?.startsWith('http') ? url : `${API_HOST}${url}`);

const ComplaintReviewModal = ({
  complaint,
  reviewSignals = [],
  nearbyComplaints = [],
  reporterStats,
  penaltyPreview,
  onClose,
  onRefresh,
  onVerify,
  onAssign,
  onStatusUpdate,
  onCloseComplaint,
  getCategoryLabel,
  onChat,
}) => {
  const [panel, setPanel] = useState(null);
  const [saving, setSaving] = useState(false);
  const [instructions, setInstructions] = useState(
    'Verify whether the reported issue actually exists at this location.'
  );
  const [fieldResult, setFieldResult] = useState('issue_not_found');
  const [fieldRemarks, setFieldRemarks] = useState('');
  const [fieldPhoto, setFieldPhoto] = useState(null);
  const [fakeReason, setFakeReason] = useState('fabricated_issue');
  const [fakeRemarks, setFakeRemarks] = useState('');
  const [duplicateNote, setDuplicateNote] = useState('');

  const flags = useMemo(
    () => (reviewSignals.length ? reviewSignals : complaint.reviewFlags || []),
    [reviewSignals, complaint.reviewFlags]
  );
  const nearby = nearbyComplaints.length
    ? nearbyComplaints
    : flags
        .filter((f) => f.relatedComplaint)
        .map((f) => ({
          _id: f.relatedComplaint,
          distanceMeters: f.distanceMeters,
          status: 'Open',
        }));

  const needsDecision = ['Submitted', 'Field-verification'].includes(complaint.status);
  const fv = complaint.fieldVerification || {};

  const run = async (fn, successMsg) => {
    try {
      setSaving(true);
      await fn();
      toast.success(successMsg);
      setPanel(null);
      onRefresh();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Request failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-3xl w-full p-6 my-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Complaint #{complaint._id.toString().slice(-6)}
            </h3>
            {complaint.requiresReview && !complaint.isFake && (
              <p className="text-sm font-medium text-amber-700 mt-1">Requires review</p>
            )}
            {complaint.isFake && (
              <p className="text-sm font-medium text-red-700 mt-1">Fake / Closed</p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Category</label>
              <p className="text-gray-900">{getCategoryLabel(complaint.category)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <p className="text-gray-900">{complaint.status}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Submitted</label>
              <p className="text-gray-900">{new Date(complaint.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Reporter</label>
              <p className="text-gray-900">{complaint.user?.name || 'Unknown'}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Description</label>
            <p className="text-gray-900 mt-1">{complaint.description}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Location</label>
            <p className="text-gray-900 mt-1">{complaint.location.address || 'Not specified'}</p>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {complaint.location.latitude}, {complaint.location.longitude}
            </p>
          </div>

          {complaint.images?.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-500">Citizen photo</label>
              <div className="grid grid-cols-3 gap-4 mt-2">
                {complaint.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={imageSrc(img.url)}
                    alt={`Complaint ${idx + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {flags.length > 0 && !complaint.isFake && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="font-semibold text-amber-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                System-generated review signals
              </p>
              <ul className="mt-2 text-sm text-amber-900 space-y-1 list-disc list-inside">
                {flags.map((flag, i) => (
                  <li key={i}>{flag.message}</li>
                ))}
              </ul>
              <p className="text-xs text-amber-800 mt-3">
                These signals do not automatically mean the complaint is fake.
              </p>
              {nearby.length > 0 && (
                <div className="mt-3 text-sm text-gray-800">
                  <p className="font-medium">Nearby open complaints</p>
                  {nearby.map((n) => (
                    <p key={n._id} className="text-gray-600">
                      #{n._id.toString().slice(-6)} · {n.distanceMeters}m · {n.status}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {reporterStats && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="font-semibold text-gray-900">Reporter information</p>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-700">
                <p>Previous complaints: {reporterStats.totalComplaints}</p>
                <p>Confirmed fake: {reporterStats.fakeComplaints}</p>
                <p>CivicFix points: {reporterStats.rewardPoints ?? 0}</p>
                <p>Demerit points: {reporterStats.demeritPoints}</p>
                <p>
                  {reporterStats.blockedUntil &&
                  new Date(reporterStats.blockedUntil) > new Date()
                    ? `Blocked until ${new Date(reporterStats.blockedUntil).toLocaleDateString()}`
                    : 'Account active'}
                </p>
              </div>
            </div>
          )}

          {fv.status && fv.status !== 'none' && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
              <p className="font-semibold text-orange-900">Field verification</p>
              <p className="text-sm mt-1 capitalize">{fv.status.replace('-', ' ')}</p>
              {fv.instructions && (
                <p className="text-sm text-gray-700 mt-1">Instructions: {fv.instructions}</p>
              )}
              {fv.status === 'completed' && (
                <div className="mt-2 text-sm space-y-1">
                  <p>
                    Result:{' '}
                    <strong>{(fv.result || '').replaceAll('_', ' ')}</strong>
                  </p>
                  {fv.distanceFromReportMeters != null && (
                    <p>Check GPS: {fv.distanceFromReportMeters}m from reported pin</p>
                  )}
                  {fv.remarks && <p>Remarks: {fv.remarks}</p>}
                  {fv.photoUrl && (
                    <img
                      src={imageSrc(fv.photoUrl)}
                      alt="Field verification"
                      className="mt-2 w-40 h-28 object-cover rounded"
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {complaint.isFake && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
              <p className="font-semibold">Fake / Closed</p>
              <p className="mt-1">
                Reason:{' '}
                {FAKE_REASONS.find((r) => r.id === complaint.fakeReason)?.label ||
                  complaint.fakeReason}
              </p>
              {complaint.fakeRemarks && <p className="mt-1">{complaint.fakeRemarks}</p>}
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-4 border-t">
            {needsDecision && (
              <>
                <button
                  onClick={onVerify}
                  className="btn-primary bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Verify complaint
                </button>
                <button onClick={() => setPanel('duplicate')} className="btn-secondary">
                  Duplicate of existing
                </button>
                <button onClick={() => setPanel('field')} className="btn-secondary">
                  Field verification
                </button>
                {fv.status === 'pending' && (
                  <button onClick={() => setPanel('fieldSubmit')} className="btn-secondary">
                    Record site check
                  </button>
                )}
                <button
                  onClick={() => setPanel('fake')}
                  className="btn-primary bg-red-600 hover:bg-red-700"
                >
                  Mark as fake
                </button>
                <button
                  onClick={onVerify}
                  className="btn-secondary"
                >
                  Reject — other reason
                </button>
              </>
            )}
            {complaint.status === 'Verified' && (
              <button onClick={onAssign} className="btn-primary">
                <UserPlus className="w-4 h-4 mr-2" />
                Assign Contractor
              </button>
            )}
            {complaint.status === 'Completed' && (
              <button
                onClick={() => onCloseComplaint('Complaint closed after verification')}
                className="btn-primary bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Close Complaint
              </button>
            )}
            {['Assigned', 'In-progress'].includes(complaint.status) && (
              <button
                onClick={() => onStatusUpdate('In-progress', 'Status updated')}
                className="btn-secondary"
              >
                Mark In Progress
              </button>
            )}
            {complaint.assignedContractor && (
              <button onClick={onChat} className="btn-primary bg-blue-600 hover:bg-blue-700">
                Chat with Contractor
              </button>
            )}
          </div>
        </div>
      </div>

      {panel === 'duplicate' && (
        <NestedDialog title="Close as duplicate" onClose={() => setPanel(null)}>
          <p className="text-sm text-gray-600 mb-3">
            Use this when the issue is real but already reported. No demerit is applied.
          </p>
          <textarea
            className="input-field w-full"
            rows="3"
            placeholder="Note (optional)"
            value={duplicateNote}
            onChange={(e) => setDuplicateNote(e.target.value)}
          />
          <div className="flex gap-2 mt-4">
            <button
              disabled={saving}
              className="btn-primary flex-1"
              onClick={() =>
                run(
                  () =>
                    municipalAPI.markDuplicate(complaint._id, {
                      duplicateOf: nearby[0]?._id,
                      reason: duplicateNote,
                    }),
                  'Closed as duplicate'
                )
              }
            >
              Confirm duplicate
            </button>
            <button className="btn-secondary flex-1" onClick={() => setPanel(null)}>
              Cancel
            </button>
          </div>
        </NestedDialog>
      )}

      {panel === 'field' && (
        <NestedDialog title="Start field verification" onClose={() => setPanel(null)}>
          <p className="text-sm text-gray-600 mb-3">
            In this version the municipal officer records the site check (photo + GPS) after visiting.
          </p>
          <textarea
            className="input-field w-full"
            rows="3"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
          <div className="flex gap-2 mt-4">
            <button
              disabled={saving}
              className="btn-primary flex-1"
              onClick={() =>
                run(
                  () => municipalAPI.startFieldVerification(complaint._id, { instructions }),
                  'Field verification pending'
                )
              }
            >
              Assign verification
            </button>
            <button className="btn-secondary flex-1" onClick={() => setPanel(null)}>
              Cancel
            </button>
          </div>
        </NestedDialog>
      )}

      {panel === 'fieldSubmit' && (
        <NestedDialog title="Record site check" onClose={() => setPanel(null)}>
          <div className="space-y-3 text-sm">
            {['issue_exists', 'issue_not_found', 'unable_to_access'].map((value) => (
              <label key={value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="fv"
                  checked={fieldResult === value}
                  onChange={() => setFieldResult(value)}
                />
                {value.replaceAll('_', ' ')}
              </label>
            ))}
            <textarea
              className="input-field w-full"
              rows="2"
              placeholder="Worker / officer remarks"
              value={fieldRemarks}
              onChange={(e) => setFieldRemarks(e.target.value)}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFieldPhoto(e.target.files?.[0] || null)}
            />
            <p className="text-xs text-gray-500">
              GPS uses the complaint pin unless the browser shares a more accurate position on submit.
            </p>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              disabled={saving}
              className="btn-primary flex-1"
              onClick={async () => {
                const formData = new FormData();
                formData.append('result', fieldResult);
                formData.append('remarks', fieldRemarks);
                formData.append('latitude', complaint.location.latitude);
                formData.append('longitude', complaint.location.longitude);
                if (fieldPhoto) formData.append('photo', fieldPhoto);
                await run(
                  () => municipalAPI.submitFieldVerification(complaint._id, formData),
                  'Site check recorded'
                );
              }}
            >
              Submit verification
            </button>
            <button className="btn-secondary flex-1" onClick={() => setPanel(null)}>
              Cancel
            </button>
          </div>
        </NestedDialog>
      )}

      {panel === 'fake' && (
        <NestedDialog title="Mark complaint as fake" onClose={() => setPanel(null)}>
          <p className="text-sm text-red-800 bg-red-50 border border-red-100 rounded p-3 mb-3">
            This deducts 3 reward points and adds 3 demerit points to the reporter
            {penaltyPreview
              ? ` (${penaltyPreview.currentPoints} → ${penaltyPreview.afterFake} demerit points). The account is blocked for ${penaltyPreview.blockDays} days after ${penaltyPreview.fakeComplaintBlockThreshold} confirmed fake complaints (${penaltyPreview.fakeComplaintCount} → ${penaltyPreview.afterFakeComplaintCount}).`
              : '.'}
          </p>
          <div className="space-y-2 text-sm mb-3">
            {FAKE_REASONS.map((reason) => (
              <label key={reason.id} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="fakeReason"
                  checked={fakeReason === reason.id}
                  onChange={() => setFakeReason(reason.id)}
                />
                {reason.label}
              </label>
            ))}
          </div>
          <textarea
            className="input-field w-full"
            rows="3"
            placeholder="Officer remarks (required)"
            value={fakeRemarks}
            onChange={(e) => setFakeRemarks(e.target.value)}
          />
          <div className="flex gap-2 mt-4">
            <button
              disabled={saving}
              className="btn-primary bg-red-600 hover:bg-red-700 flex-1"
              onClick={() =>
                run(
                  () =>
                    municipalAPI.markFake(complaint._id, {
                      fakeReason,
                      remarks: fakeRemarks,
                    }),
                  'Complaint marked fake'
                )
              }
            >
              Confirm fake complaint
            </button>
            <button className="btn-secondary flex-1" onClick={() => setPanel(null)}>
              Cancel
            </button>
          </div>
        </NestedDialog>
      )}
    </div>
  );
};

const NestedDialog = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4">
    <div className="bg-white rounded-lg max-w-md w-full p-5">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-bold text-gray-900">{title}</h4>
        <button onClick={onClose} className="text-gray-400">
          <XCircle className="w-5 h-5" />
        </button>
      </div>
      {children}
    </div>
  </div>
);

export default ComplaintReviewModal;
