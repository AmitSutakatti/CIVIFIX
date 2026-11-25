import { useEffect, useState } from 'react';
import { Award, Mail, RefreshCw, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { municipalAPI } from '../services/api';

const EMPTY_FORM = {
  eventName: '',
  venueName: '',
  venueAddress: '',
  eventDate: '',
  eventTime: '',
  message: '',
};

const EMAIL_SUBJECT =
  'CIVIFIX — Congratulations! You Are a Top 5 Contributor';

const RewardLeaderboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const loadLeaderboard = async () => {
    try {
      const response = await municipalAPI.getRewardLeaderboard();
      setData(response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const updateForm = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const submitAnnouncement = async () => {
    try {
      setSubmitting(true);
      const response = await municipalAPI.createRewardAnnouncement(form);
      setData((current) => ({ ...current, announcement: response.data.data.announcement }));
      setShowForm(false);
      setShowPreview(false);
      setForm(EMPTY_FORM);
      toast.success('Reward ceremony announcement processed');
    } catch (error) {
      if (error.response?.status === 409) {
        setData((current) => ({
          ...current,
          announcement: error.response.data.data?.announcement || current?.announcement,
        }));
        setShowForm(false);
        toast.error('An announcement already exists for this period. Its delivery status is shown below.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to send announcement');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const retryFailed = async () => {
    if (!data?.announcement) return;
    try {
      setRetrying(true);
      const response = await municipalAPI.retryRewardAnnouncement(data.announcement.id);
      setData((current) => ({
        ...current,
        announcement: response.data.data.announcement,
      }));
      toast.success('Failed recipient emails have been retried');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to retry email delivery');
    } finally {
      setRetrying(false);
    }
  };

  const announcement = data?.announcement;
  const failedCount =
    announcement?.recipients.filter((recipient) => recipient.status === 'failed').length || 0;

  if (loading) {
    return <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">Loading leaderboard…</div>;
  }

  if (!data) {
    return <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">Leaderboard data is unavailable.</div>;
  }

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Six-month citizen leaderboard</h2>
            <p className="text-sm text-gray-500 mt-1">
              {data.period.label} · Points reflect verified complaints and fake-report penalties in this period.
            </p>
          </div>
          {data.leaderboard.length > 0 && !announcement && (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white shadow hover:bg-blue-800"
            >
              <Award className="h-5 w-5" />
              Announce Reward Ceremony to Top 5
            </button>
          )}
        </div>

        {data.leaderboard.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            No eligible citizens have verified complaints in this leaderboard period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Rank', 'Citizen', 'Net points', 'Genuine complaints verified'].map((heading) => (
                    <th key={heading} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.leaderboard.map((citizen) => (
                  <tr key={citizen.citizenId}>
                    <td className="px-6 py-4 font-semibold text-gray-900">#{citizen.rank}</td>
                    <td className="px-6 py-4 text-gray-700">{citizen.name}</td>
                    <td className="px-6 py-4 text-gray-700">{citizen.netPoints}</td>
                    <td className="px-6 py-4 text-gray-700">{citizen.verifiedComplaints}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {announcement && (
        <section className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Reward ceremony announcement</h2>
              <p className="text-sm text-gray-500 mt-1">
                This period already has an announcement. Created {new Date(announcement.createdAt).toLocaleString()}.
              </p>
            </div>
            {failedCount > 0 && (
              <button
                type="button"
                disabled={retrying}
                onClick={retryFailed}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2 font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
              >
                <RefreshCw className="h-4 w-4" />
                {retrying ? 'Retrying…' : `Retry ${failedCount} failed email${failedCount === 1 ? '' : 's'}`}
              </button>
            )}
          </div>
          <div className="p-6 grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
            <p><strong>Event:</strong> {announcement.eventName}</p>
            <p><strong>Venue:</strong> {announcement.venueName}</p>
            <p><strong>Address:</strong> {announcement.venueAddress}</p>
            <p><strong>Date and time:</strong> {announcement.eventDate} at {announcement.eventTime}</p>
            <p className="sm:col-span-2"><strong>Officer's message:</strong> {announcement.message}</p>
          </div>
          <div className="overflow-x-auto border-t border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Citizen', 'Rank', 'Delivery status', 'Delivered at'].map((heading) => (
                    <th key={heading} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {announcement.recipients.map((recipient) => (
                  <tr key={recipient.citizenId}>
                    <td className="px-6 py-4 text-gray-700">{recipient.citizenName}</td>
                    <td className="px-6 py-4 text-gray-700">#{recipient.rank}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                        recipient.status === 'sent'
                          ? 'bg-green-100 text-green-800'
                          : recipient.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                      }`}>
                        {recipient.status}
                      </span>
                      {recipient.lastError && <p className="mt-1 text-xs text-red-700">{recipient.lastError}</p>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {recipient.deliveredAt ? new Date(recipient.deliveredAt).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-8 w-full max-w-2xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Announce reward ceremony to Top 5</h2>
                <p className="text-sm text-gray-500">The backend will determine the current recipients.</p>
              </div>
              <button type="button" onClick={() => { setShowForm(false); setShowPreview(false); }} aria-label="Close form">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            {!showPreview ? (
              <form
                className="space-y-4 p-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  setShowPreview(true);
                }}
              >
                <Field label="Ceremony / reward event name" name="eventName" value={form.eventName} onChange={updateForm} maxLength={120} />
                <Field label="Venue name" name="venueName" value={form.venueName} onChange={updateForm} maxLength={160} />
                <label className="block text-sm font-medium text-gray-700">
                  Complete venue address
                  <textarea name="venueAddress" value={form.venueAddress} onChange={updateForm} maxLength={500} required rows={2} className="input-field mt-1" />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Ceremony date" name="eventDate" type="date" value={form.eventDate} onChange={updateForm} />
                  <Field label="Ceremony time" name="eventTime" type="time" value={form.eventTime} onChange={updateForm} />
                </div>
                <label className="block text-sm font-medium text-gray-700">
                  Additional announcement message
                  <textarea name="message" value={form.message} onChange={updateForm} maxLength={2000} required rows={4} className="input-field mt-1" />
                </label>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">Preview announcement</button>
                </div>
              </form>
            ) : (
              <div className="p-5">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Email preview · Top 5 example recipient</p>
                  <h3 className="mt-2 text-lg font-bold text-gray-900">{EMAIL_SUBJECT}</h3>
                  <div className="mt-4 rounded-lg bg-white p-5 text-sm leading-6 text-gray-700 shadow-sm">
                    <p className="text-center text-xl font-bold tracking-widest text-blue-800">CIVIFIX</p>
                    <p className="mt-3 font-semibold">Congratulations, {data.leaderboard[0].name}!</p>
                    <p className="mt-2">You are invited to receive your reward and be honoured for your contribution to CIVIFIX.</p>
                    <p className="mt-3"><strong>Your leaderboard achievement</strong><br />
                      Rank: #1<br />
                      Six-month period: {data.period.label}<br />
                      Net leaderboard points: {data.leaderboard[0].netPoints}<br />
                      Genuine complaints verified: {data.leaderboard[0].verifiedComplaints}
                    </p>
                    <p className="mt-3"><strong>Reward ceremony</strong><br />
                      Event: {form.eventName}<br />
                      Venue: {form.venueName}<br />
                      Complete address: {form.venueAddress}<br />
                      Date: {form.eventDate}<br />
                      Time: {form.eventTime}
                    </p>
                    <p className="mt-3"><strong>A message from the Municipal Officer</strong><br />{form.message}</p>
                    <p className="mt-3">Thank you for helping make your community better. We look forward to honouring your contribution.</p>
                    <p className="mt-4 text-center text-xs text-gray-500">CIVIFIX — Building better communities together</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-500">
                  Each eligible recipient receives the same announcement details with their own name, rank, and leaderboard statistics.
                </p>
                <div className="mt-5 flex flex-wrap justify-end gap-3">
                  <button type="button" disabled={submitting} onClick={() => setShowPreview(false)} className="btn-secondary">Edit details</button>
                  <button type="button" disabled={submitting} onClick={submitAnnouncement} className="btn-primary inline-flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {submitting ? 'Sending to eligible citizens…' : 'Confirm and send to Top 5'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Field = ({ label, name, value, onChange, type = 'text', maxLength }) => (
  <label className="block text-sm font-medium text-gray-700">
    {label}
    <input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      maxLength={maxLength}
      required
      className="input-field mt-1"
    />
  </label>
);

export default RewardLeaderboard;
