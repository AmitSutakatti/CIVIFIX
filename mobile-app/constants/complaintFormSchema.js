import { z } from 'zod';

function requiredText(min, max, label) {
  return z
    .string()
    .max(max, `${label} must be ${max} characters or fewer`)
    .refine((value) => value.trim().length >= min, {
      message: `${label} must be at least ${min} characters`,
    })
    .refine((value) => value.trim().length > 0, {
      message: `${label} cannot be only spaces`,
    });
}

export const complaintDetailsSchema = z.object({
  title: requiredText(5, 100, 'Title'),
  description: requiredText(20, 500, 'Description'),
  additionalInfo: z
    .string()
    .max(300, 'Additional information must be 300 characters or fewer'),
});

export function trimmedComplaintDetails(values) {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    additionalInfo: values.additionalInfo.trim(),
  };
}
