// axios imports removed if unused

export interface ApiSuccessResponse<T> {
  success: true
  data: T
  status: number
  headers?: any
}

export interface ApiErrorResponse {
  success: false
  status: number
  message: string
  errors?: any
  code?: string
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

/**
 * Normalizes an Axios error into a predictable object.
 */
export const normalizeError = (error: any): ApiErrorResponse => {
  // ── Server responded with a non-2xx status ──────────────────────
  if (error.response) {
    const { status, data } = error.response

    const message =
      (typeof data === 'string' ? data : data?.message) ||
      data?.error ||
      data?.detail ||
      getDefaultMessageForStatus(status)

    return {
      success: false,
      status,
      message,
      errors: data?.errors || data?.fieldErrors || null,
      code: null as any,
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

  // Something else went wrong before the request was sent 
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
 */
export const handleRequest = async <T>(requestPromise: Promise<any>): Promise<ApiResponse<T>> => {
  try {
    const response = await requestPromise
    return {
      success: true,
      data: response.data,
      status: response.status,
      headers: response.headers,
    }
  } catch (error) {
    return normalizeError(error)
  }
}

// ── Helpers ───────────────────────────────────────────────────────────

function getDefaultMessageForStatus(status: number): string {
  const messages: Record<number, string> = {
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

