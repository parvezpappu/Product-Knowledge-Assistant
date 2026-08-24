const PROVIDER_QUOTA_ERROR_CODE =
  "AI_QUOTA_EXCEEDED";

function getErrorMessage(error) {
  return String(error?.message || error).toUpperCase();
}

function isProviderQuotaError(error) {
  const status = Number(
    error?.status || error?.statusCode
  );
  const message = getErrorMessage(error);

  return (
    error?.code === PROVIDER_QUOTA_ERROR_CODE ||
    status === 429 ||
    message.includes("RESOURCE_EXHAUSTED") ||
    message.includes("QUOTA EXCEEDED")
  );
}

function isDailyQuotaError(error) {
  if (!isProviderQuotaError(error)) {
    return false;
  }

  const message = getErrorMessage(error);

  return (
    message.includes("PERDAY") ||
    message.includes("PER DAY") ||
    message.includes("REQUESTS_PER_DAY") ||
    message.includes("FREE_TIER_REQUESTS")
  );
}

function createProviderQuotaError(cause) {
  const error = new Error(
    "The AI provider quota is currently exhausted."
  );

  error.name = "ProviderQuotaError";
  error.code = PROVIDER_QUOTA_ERROR_CODE;
  error.statusCode = 503;
  error.cause = cause;

  return error;
}

module.exports = {
  createProviderQuotaError,
  isDailyQuotaError,
  isProviderQuotaError,
};
