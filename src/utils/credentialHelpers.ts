export function maskCredential(value: string): string {
  if (!value) return "";
  if (value.length <= 4) return "●".repeat(value.length);
  return "●".repeat(Math.max(4, value.length - 4)) + value.slice(-4);
}

export function validateSlackToken(token: string): boolean {
  return /^xox[bpsa]-[A-Za-z0-9-]+$/.test(token);
}

export function validateSMTPConfig(config: Record<string, string>): boolean {
  return !!(config.host && config.port && config.username && config.fromEmail);
}
