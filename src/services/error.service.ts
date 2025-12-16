import toast from 'react-hot-toast'
import { logger } from '../utils/logger'

export class ErrorService {
  static handle(error: Error | unknown, context: string, showToast: boolean = true): void {
    const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue'

    logger.error(`[${context}]`, { error, message: errorMessage })

    if (showToast) {
      toast.error(errorMessage)
    }
  }

  static handleApiError(error: unknown, context: string): string {
    let message = 'Une erreur est survenue'

    if (error instanceof Error) {
      message = error.message
    } else if (typeof error === 'string') {
      message = error
    } else if (error && typeof error === 'object' && 'message' in error) {
      message = String(error.message)
    }

    this.handle(new Error(message), context, true)
    return message
  }

  static async withErrorHandling<T>(
    fn: () => Promise<T>,
    context: string,
    options?: {
      onError?: (error: Error) => void
      showToast?: boolean
    }
  ): Promise<T | null> {
    try {
      return await fn()
    } catch (error) {
      this.handle(error, context, options?.showToast ?? true)
      if (options?.onError && error instanceof Error) {
        options.onError(error)
      }
      return null
    }
  }
}

export const errorService = ErrorService
