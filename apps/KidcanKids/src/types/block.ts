// src/types/block.ts
export type BlockState = {
  is_blocked: boolean;
  block_until: string | null; // ISO datetime iš backend
  message: string | null;
};
