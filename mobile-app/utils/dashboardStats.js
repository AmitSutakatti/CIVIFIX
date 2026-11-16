// Citizen dashboard numbers are derived from GET /api/complaints/my.
// The user API has no statistics endpoint. Every status in Complaint.js
// belongs to exactly one bucket so the three counts add up to the total.

const PENDING = new Set(['Submitted', 'Verified', 'Field-verification']);
const IN_PROGRESS = new Set(['Assigned', 'In-progress']);
const COMPLETED = new Set(['Completed', 'Closed']);

export function summarizeComplaints(complaints = []) {
  const stats = { total: complaints.length, pending: 0, inProgress: 0, completed: 0 };

  for (const complaint of complaints) {
    if (PENDING.has(complaint.status)) stats.pending += 1;
    else if (IN_PROGRESS.has(complaint.status)) stats.inProgress += 1;
    else if (COMPLETED.has(complaint.status)) stats.completed += 1;
  }

  return stats;
}

export function complaintTitle(complaint) {
  const title = String(complaint?.title || '').trim();
  if (title) return title;

  const description = String(complaint?.description || '').trim();
  if (!description) return 'Untitled complaint';
  const firstLine = description.split('\n')[0];
  return firstLine.length > 80 ? `${firstLine.slice(0, 77)}…` : firstLine;
}

export function formatComplaintDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}
