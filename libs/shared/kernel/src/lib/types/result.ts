/**
 * Success or failure, without throwing.
 *
 *   return Result.ok(user);
 *   return Result.fail(new UserNotFoundError(id));
 *
 *   if (result.isSuccess) result.value; else result.error;
 */
export type Result<T, E = Error> =
  | { readonly isSuccess: true; readonly value: T }
  | { readonly isSuccess: false; readonly error: E };

export const Result = {
  ok: <T = void>(value: T = undefined as T): Result<T, never> => ({ isSuccess: true, value }),
  fail: <E>(error: E): Result<never, E> => ({ isSuccess: false, error }),
};