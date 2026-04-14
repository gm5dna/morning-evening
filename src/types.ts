export type Period = "morning" | "evening";

export interface DateQuery {
  month: number;  // 1-12
  day: number;    // 1-31
}
