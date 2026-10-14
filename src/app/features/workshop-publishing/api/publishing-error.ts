const messages: Record<string, string> = {
  MODEL_NOT_CONFIGURED: "Draft generation is not configured. Ask the server administrator to configure the model and API key.",
  GENERATION_IMAGE_LOOKUP_FAILED: "Draft generation could not load workshop images. Check your administrator session and the uploader service.",
  MODEL_TIMEOUT: "The AI model timed out while generating the draft. Try a narrower workshop brief.",
  MODEL_ACCESS_DENIED: "The AI provider denied model access. Ask the server administrator to check the API key and model permissions.",
  MODEL_QUOTA_EXHAUSTED: "The AI project has no available quota or credits. Check the API project billing before retrying.",
  MODEL_RATE_LIMITED: "The AI provider is rate limiting draft generation. Wait a moment and retry.",
  MODEL_REQUEST_REJECTED: "The AI provider rejected the generation request. Ask the server administrator to check the model and output format.",
  MODEL_UNAVAILABLE: "The AI provider is unavailable. Try again later.",
  MODEL_OUTPUT_INCOMPLETE: "The AI model did not finish the draft. Try a narrower workshop brief.",
  MODEL_REFUSED: "The AI model declined this workshop brief. Revise the brief and retry.",
  GENERATED_DRAFT_INVALID: "The AI returned a draft that failed workshop validation. Try a narrower brief or generate again.",
};
const fallback = 'The publishing agent could not complete this request. Check the draft, service access and server configuration.';
export function publishingError(response: object): string {
  if (!('content' in response) || !Array.isArray(response.content)) return fallback;
  for (const item of response.content) {
    if (!item || typeof item !== 'object' || item.type !== 'text' || typeof item.text !== 'string') continue;
    try {
      const value: unknown = JSON.parse(item.text);
      if (!value || typeof value !== 'object' || !('error' in value) ||
          !value.error || typeof value.error !== 'object' || !('code' in value.error) ||
          typeof value.error.code !== 'string') continue;
      if (Object.hasOwn(messages, value.error.code)) return messages[value.error.code];
    } catch { /* An unrecognized response retains the safe fallback. */ }
  }
  return fallback;
}
