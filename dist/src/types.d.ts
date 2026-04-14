export interface Devotional {
    date: string;
    period: "morning" | "evening";
    verse: string;
    scripture: string;
    text: string;
}
export type Period = "morning" | "evening";
export interface DateQuery {
    month: number;
    day: number;
}
