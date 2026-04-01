/**
 * Centralized API error handler.
 *
 * Normalizes every Axios error into a consistent shape so that
 * components never have to deal with raw HTTP error objects.
 *
 * Shape returned on failure:
 *   { success: false, status, message, errors, code }
 *
 * Shape returned on success (via `handleRequest`):
 *   { success: true, data, status }
 */

/**
 * Normalizes an Axios error into a predictable object.
 *
 * @param {import('axios').AxiosError} error
 * @returns {{ success: false, status: number, message: string, errors: object|null, code: string|null }}
 */
export const normalizeError = (error) => {
  // ── Server responded with a non-2xx status ──────────────────────
  if (error.response) {
    const { status, data } = error.response

    // Try to extract a human-readable message from common backend shapes
    const message =
      data?.message ||
      data?.error ||
      data?.detail ||
      getDefaultMessageForStatus(status)

    return {
      success: false,
      status,
      message,
      errors: data?.errors || data?.fieldErrors || null, // field-level validation
      code: null,
    }
  }

  // ── Request was sent but no response received (network / timeout) ─
  if (error.request) {
    const isTimeout = error.code === 'ECONNABORTED'

    return {
      success: false,
      status: 0,
      message: isTimeout
        ? 'The request timed out. Please try again.'
        : 'Unable to reach the server. Please check your connection.',
      errors: null,
      code: error.code || 'NETWORK_ERROR',
    }
  }

  // ── Something else went wrong before the request was sent ─────────
  return {
    success: false,
    status: -1,
    message: error.message || 'An unexpected error occurred.',
    errors: null,
    code: 'CLIENT_ERROR',
  }
}

/**
 * Wraps an Axios promise so the caller always gets a normalized result.
 *
 * Usage:
 *   const result = await handleRequest(API.post('/login', creds))
 *   if (!result.success) { setError(result.message); return }
 *   // use result.data
 *
 * @param {Promise<import('axios').AxiosResponse>} requestPromise
 * @returns {Promise<{ success: true, data: any, status: number } | { success: false, status: number, message: string, errors: object|null, code: string|null }>}
 */
export const handleRequest = async (requestPromise) => {
  try {
    const response = await requestPromise
    return {
      success: true,
      data: response.data,
      status: response.status,
    }
  } catch (error) {
    return normalizeError(error)
  }
}

// ── Helpers ───────────────────────────────────────────────────────────

/**
 * Returns a user-friendly default message for common HTTP status codes.
 */
function getDefaultMessageForStatus(status) {
  const messages = {
    400: 'The request was invalid. Please check your input.',
    401: 'Authentication failed. Please log in again.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    409: 'A conflict occurred. The resource may already exist.',
    422: 'Validation failed. Please review the highlighted fields.',
    429: 'Too many requests. Please wait a moment and try again.',
    500: 'An internal server error occurred. Please try later.',
    502: 'The server is temporarily unavailable. Please try later.',
    503: 'The service is currently under maintenance. Please try later.',
  }

  return messages[status] || `Request failed with status ${status}.`
}
