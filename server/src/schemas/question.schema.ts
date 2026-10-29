import { z } from 'zod';

export const questionSchema = z
  .object({
    id: z.string().uuid().optional(),
    text: z
      .string({ required_error: 'Question text is required' })
      .trim()
      .min(3, 'Question text must be at least 3 characters long')
      .max(1000, 'Question text cannot exceed 1000 characters'),
    options: z
      .array(
        z
          .string({ required_error: 'Option text is required' })
          .trim()
          .min(1, 'Option text cannot be empty')
          .max(500, 'Option text cannot exceed 500 characters'),
        { required_error: 'Answer options are required' }
      )
      .length(4, 'Exactly four answer options are required'),
    correctIndex: z
      .number({ required_error: 'Correct answer index is required' })
      .int('Correct index must be an integer')
      .min(0, 'Correct index must be between 0 and 3')
      .max(3, 'Correct index must be between 0 and 3'),
    explanation: z
      .string({ required_error: 'Explanation is required' })
      .trim()
      .min(3, 'Explanation must be at least 3 characters long')
      .max(2000, 'Explanation cannot exceed 2000 characters'),
    timeLimitSeconds: z
      .number()
      .int('Time limit must be an integer')
      .min(5, 'Time limit must be at least 5 seconds')
      .max(300, 'Time limit cannot exceed 300 seconds (5 minutes)')
      .default(30),
    order: z.number().int().min(0).optional(),
  })
  .refine(
    (data) => {
      // Check for duplicate options (case-insensitive trimmed comparison)
      const normalizedOptions = data.options.map((opt) => opt.trim().toLowerCase());
      const uniqueOptions = new Set(normalizedOptions);
      return uniqueOptions.size === 4;
    },
    {
      message: 'All four answer options must be unique',
      path: ['options'],
    }
  );

export type QuestionInput = z.infer<typeof questionSchema>;
