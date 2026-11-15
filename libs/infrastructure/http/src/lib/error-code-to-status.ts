const MAP: Record<string, number> = {
  NOT_FOUND: 404,
  CONFLICT: 409,
  FK_VIOLATION: 409,
  VALIDATION: 422,
  FORBIDDEN: 403,
  UNAUTHORIZED: 401,
};
export const statusFromCode = (code: string) => MAP[code] ?? 500;