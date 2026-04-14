export interface Devotional {
  date: string;        // e.g. "january-1"
  period: "morning" | "evening";
  verse: string;       // key verse text, e.g. "They did eat of the fruit..."
  scripture: string;   // key verse reference, e.g. "Joshua 5:12"
  text: string;        // Spurgeon's prose devotional
}

export type Period = "morning" | "evening";

export interface DateQuery {
  month: number;  // 1-12
  day: number;    // 1-31
}
