export declare const POINTS: {
    readonly REPORT_CREATED: 10;
    readonly REPORT_VERIFIED: 2;
    readonly RESOLUTION_CONFIRMED: 50;
    readonly COMMENT_ADDED: 1;
};
export type GamificationEvent = keyof typeof POINTS;
export declare const BADGES: Record<number, string>;
