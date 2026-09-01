// "pending" | "added" | "declined" for MovementLabExerciseRequest.status — see that model's
// own comment in schema.prisma. Same fixed-value-set convention as
// lib/license-verification.ts's LICENSE_STATUSES.
export const MOVEMENT_LAB_REQUEST_STATUSES = ["pending", "added", "declined"] as const;
export type MovementLabRequestStatus = (typeof MOVEMENT_LAB_REQUEST_STATUSES)[number];
