
// Base interface for all content types
export interface BaseContent {
  id: string;
  title: string;
  description: string;
  order: number;
  xpReward: number;
  createdAt: Date;
  updatedAt: Date;
}
