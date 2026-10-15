export const ADMIN_PASSWORD_MIN_LENGTH = 6;
export const ADMIN_PASSWORD_MAX_LENGTH = 100;

export type PasswordLengthError = "too-short" | "too-long" | null;

export function getPasswordLengthError(password: string): PasswordLengthError {
  if (password.length < ADMIN_PASSWORD_MIN_LENGTH) return "too-short";
  if (password.length > ADMIN_PASSWORD_MAX_LENGTH) return "too-long";
  return null;
}
