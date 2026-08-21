export const Role = ["ADMIN", "USER"] as const;

export type Role = (typeof Role)[number];
