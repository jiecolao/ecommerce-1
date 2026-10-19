// Matches the approved development project's Email OTP length. Keep the two
// forms and validation together; changing this does not change provider policy.
export const EMAIL_OTP_LENGTH = 8;

export function isCompleteEmailOtp(code: string) {
  return code.length === EMAIL_OTP_LENGTH && /^\d+$/.test(code);
}

export function updateEmailOtp(otp: string[], index: number, value: string) {
  if (otp.length !== EMAIL_OTP_LENGTH || index < 0 || index >= otp.length || !/^\d*$/.test(value)) return null;
  // A full pasted/autofilled code replaces every box, including leading zeros.
  // Reject excess digits rather than silently truncating a different code.
  const start = value.length === EMAIL_OTP_LENGTH ? 0 : index;
  if (value.length > otp.length - start) return null;
  const digits = [...otp];
  if (!value) digits[start] = '';
  else [...value].forEach((digit, offset) => { digits[start + offset] = digit; });
  return { digits, focus: Math.min(start + value.length, otp.length - 1) };
}
