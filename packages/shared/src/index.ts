import { z } from 'zod';

export const LynxRequestSchema = z.object({
  prompt: z.string().min(1),
  modelIds: z.array(z.string()).min(1),
  includeSynthesis: z.boolean().default(false),
});

export type LynxRequest = z.infer<typeof LynxRequestSchema>;

export type LynxEventType = 'start' | 'chunk' | 'error' | 'done' | 'synthesis';

export type LynxEvent = 
  | { type: 'start'; modelId: string }
  | { type: 'chunk'; modelId: string; text: string }
  | { type: 'error'; modelId: string; error: string }
  | { type: 'done'; modelId: string }
  | { type: 'synthesis'; text: string }; // Final synthesis chunk(s)
