import { z } from 'zod';

/**
 * Validation schema for the Score Borrower form.
 * Ensures BVN is 11 digits and phone is a valid Nigerian number.
 */
export const scoreBorrowerSchema = z.object({
  bvn: z
    .string()
    .min(1, 'BVN is required')
    .regex(/^\d{11}$/, 'BVN must be exactly 11 digits'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .refine(
      (val) => {
        // Accept formats: +234..., 0..., 234...
        const cleaned = val.replace(/[\s\-\(\)]/g, '');
        return /^\+?234\d{10}$/.test(cleaned) || /^0\d{10}$/.test(cleaned);
      },
      { message: 'Enter a valid Nigerian phone number' }
    ),
  amount: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(Number(val)) && Number(val) > 0),
      { message: 'Loan amount must be a positive number' }
    ),
  tenure: z
    .string()
    .regex(/^\d+$/, 'Tenure must be a number')
    .refine(
      (val) => {
        const num = Number(val);
        return num >= 1 && num <= 365;
      },
      { message: 'Tenure must be between 1 and 365 days' }
    ),
  tiers: z
    .array(z.enum(['formal', 'alternative', 'psychographic']))
    .min(1, 'At least one data tier must be selected'),
});

export type ScoreBorrowerFormInput = z.infer<typeof scoreBorrowerSchema>;

/**
 * Validation schema for the Loan Outcome submission form.
 * Updated to match backend OutcomeSubmission schema.
 */
export const outcomeSubmissionSchema = z.object({
  loanId: z
    .string()
    .min(1, 'Loan ID is required')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Loan ID must be alphanumeric'),
  bvn: z
    .string()
    .min(1, 'BVN is required')
    .regex(/^\d{11}$/, 'BVN must be exactly 11 digits'),
  outcome: z.enum(['REPAID_ON_TIME', 'REPAID_LATE', 'DEFAULTED', 'RESTRUCTURED', 'WRITTEN_OFF']),
  disbursementDate: z
    .string()
    .min(1, 'Disbursement date is required')
    .refine(
      (val) => !isNaN(Date.parse(val)),
      { message: 'Invalid date format' }
    ),
  dueDate: z
    .string()
    .min(1, 'Due date is required')
    .refine(
      (val) => !isNaN(Date.parse(val)),
      { message: 'Invalid date format' }
    ),
  scoreAtOrigination: z
    .string()
    .min(1, 'Score at origination is required')
    .refine(
      (val) => {
        const num = Number(val);
        return num >= 300 && num <= 850;
      },
      { message: 'Score must be between 300 and 850' }
    ),
  outcomeDate: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      { message: 'Invalid date format' }
    ),
  amount: z
    .string()
    .min(1, 'Loan amount is required')
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      { message: 'Amount must be a positive number' }
    ),
});

export type OutcomeSubmissionFormInput = z.infer<typeof outcomeSubmissionSchema>;
