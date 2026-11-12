export function validateDiagnosticRecipient(value: string): string;
export function readHiddenTerminalValue(input: NodeJS.ReadStream, output: NodeJS.WriteStream, prompt: string): Promise<Buffer>;
export function sendInstituteSmtpDiagnostic(input: {
  recipient: string;
  password: string;
  createTransport?: (options: Record<string, unknown>) => {
    sendMail(message: Record<string, unknown>): Promise<{ accepted?: Array<string | { address?: string }>; rejected?: unknown[] }>;
  };
}): Promise<{ accepted: true }>;
export function runInteractiveSmtpDiagnostic(input: {
  input: NodeJS.ReadStream;
  output: NodeJS.WriteStream;
  sendDiagnostic?: (input: { recipient: string; password: string }) => Promise<{ accepted: true }>;
}): Promise<{ accepted: true }>;
