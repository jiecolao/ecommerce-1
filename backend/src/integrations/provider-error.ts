import { HttpException, HttpStatus } from '@nestjs/common';

const messages = {
  opencritic: 'Unable to retrieve game data.',
  paymongo: 'Unable to create checkout session.',
} as const;

export function createProviderException(error: unknown, provider: keyof typeof messages): HttpException {
  let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
  try {
    const candidate = (error as { response?: { status?: unknown } | null } | null | undefined)?.response?.status;
    if (typeof candidate === 'number' && Number.isInteger(candidate) && candidate >= 400 && candidate <= 599) {
      status = candidate;
    }
  } catch {
    // Unexpected thrown values/getters must not escape with upstream details.
  }

  // Read only the status. Never retain or serialize upstream data, messages,
  // stack traces, request headers, credentials or an unsanitized error cause.
  return new HttpException({ statusCode: status, message: messages[provider] }, status);
}
