export interface Devotional {
  date: string;        // e.g. "january-1"
  period: "morning" | "evening";
  scripture: string;   // key verse reference, e.g. "Joshua 5:12"
  text: string;        // Spurgeon's prose devotional
}

export type Period = "morning" | "evening";

export interface DateQuery {
  month: number;  // 1-12
  day: number;    // 1-31
}
