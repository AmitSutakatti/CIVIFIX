import { useSyncExternalStore } from 'react';

// In-memory draft for the complaint registration flow.
// It lives outside the screen so Back and Continue do not wipe typed text.

const emptyDraft = {
  categoryId: '',
  categoryName: '',
  group: '',
  routingType: '',
  title: '',
  description: '',
  additionalInfo: '',
  latitude: null,
  longitude: null,
  address: null,
  images: [],
};

let draft = { ...emptyDraft };
const listeners = new Set();

function emit() {
  listeners.forEach((listener) => listener());
}

export function getComplaintDraft() {
  return draft;
}

export function updateComplaintDraft(partial) {
  draft = { ...draft, ...partial };
  emit();
  return draft;
}

export function resetComplaintDraft() {
  draft = { ...emptyDraft, images: [] };
  emit();
  return draft;
}

export function useComplaintDraft() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getComplaintDraft,
    getComplaintDraft
  );
}
