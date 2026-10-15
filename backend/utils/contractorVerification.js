/**
 * Legacy contractors (no workflow record) are treated as already eligible.
 */
export function isContractorPortalEligible(user) {
  if (!user || user.role !== 'contractor') {
    return true;
  }
  const st = user.contractorVerification?.status;
  if (
    !user.contractorVerification ||
    st === undefined ||
    st === 'none' ||
    st === null
  ) {
    return true;
  }
  return st === 'eligible';
}

export function contractorVerificationForClient(user) {
  if (!user || user.role !== 'contractor') {
    return null;
  }
  const cv = user.contractorVerification;
  if (!cv || !cv.status || cv.status === 'none') {
    return { status: 'eligible' };
  }
  return {
    status: cv.status,
    submittedAt: cv.submittedAt,
    appointmentAt: cv.appointmentAt,
    appointmentNotes: cv.appointmentNotes,
    rejectionReason: cv.rejectionReason,
    verificationNote: cv.verificationNote,
    degreeCertificateOriginalName: cv.degreeCertificateOriginalName,
    degreeCertificatePath: cv.degreeCertificatePath,
  };
}
