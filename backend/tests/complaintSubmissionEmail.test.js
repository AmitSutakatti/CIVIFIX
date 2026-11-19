import assert from 'node:assert/strict';
import test from 'node:test';
import { buildComplaintSubmissionEmail } from '../templates/complaintSubmissionEmail.js';

test('builds confirmation email from saved complaint data and escapes HTML values', () => {
  const { subject, html } = buildComplaintSubmissionEmail({
    _id: 'complaint-123',
    category: 'road',
    title: '<script>alert("x")</script>',
    description: 'Pothole & damaged road',
    createdAt: new Date('2026-01-02T03:04:00.000Z'),
    location: { address: 'Main Street <North>' },
    status: 'Submitted',
  });

  assert.equal(subject, 'CIVIFIX - Complaint Submitted Successfully');
  assert.match(html, /CIVIFIX — Complaint Submission Confirmation/);
  assert.match(html, /complaint-123/);
  assert.match(html, /Road Issues/);
  assert.match(html, /&lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt;/);
  assert.match(html, /Pothole &amp; damaged road/);
  assert.match(html, /January 2, 2026 at 3:04 AM UTC/);
  assert.match(html, /Main Street &lt;North&gt;/);
  assert.match(html, /Status<\/th>[\s\S]*?Submitted/);
  assert.match(html, /awaiting verification by the Municipal Officer/);
});

test('omits the location row when the saved complaint has no address', () => {
  const { html } = buildComplaintSubmissionEmail({
    _id: 'complaint-456',
    category: 'water',
    title: 'Water leak',
    description: 'A leak needs repair.',
    createdAt: new Date('2026-01-02T03:04:00.000Z'),
    location: {},
    status: 'Submitted',
  });

  assert.doesNotMatch(html, /<th[^>]*>Location<\/th>/);
});
