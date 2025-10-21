/**
 * Centralized logging utility for the application
 * 
 * Provides structured logging with different levels and contexts.
 * In production, logs are filtered and can be sent to external services.
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
} as const

type LogLevel = keyof typeof LOG_LEVELS

interface LogContext {
  component?: string
  function?: string
  userId?: string
  txHash?: string
  surveyId?: string
  [key: string]: unknown
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isDebugEnabled = this.isDevelopment || process.env.VITE_ENABLE_DEBUG === 'true'
  private currentLogLevel = this.isDevelopment ? LOG_LEVELS.DEBUG : LOG_LEVELS.WARN

  /**
   * Log an error message
   */
  error(message: string, error?: unknown, context?: LogContext): void {
    if (LOG_LEVELS.ERROR <= this.currentLogLevel) {
      this.log('ERROR', message, { error, ...context })
    }
  }

  /**
   * Log a warning message
   */
  warn(message: string, data?: unknown, context?: LogContext): void {
    if (LOG_LEVELS.WARN <= this.currentLogLevel) {
      this.log('WARN', message, { data, ...context })
    }
  }

  /**
   * Log an info message
   */
  info(message: string, data?: unknown, context?: LogContext): void {
    if (LOG_LEVELS.INFO <= this.currentLogLevel) {
      this.log('INFO', message, { data, ...context })
    }
  }

  /**
   * Log a debug message (only in development)
   */
  debug(message: string, data?: unknown, context?: LogContext): void {
    if (LOG_LEVELS.DEBUG <= this.currentLogLevel && this.isDebugEnabled) {
      this.log('DEBUG', message, { data, ...context })
    }
  }

  /**
   * Log transaction-related events
   */
  transaction(event: 'INITIATED' | 'PENDING' | 'CONFIRMED' | 'FAILED', txHash: string, context?: LogContext): void {
    this.info(`Transaction ${event}`, { txHash }, { ...context, category: 'transaction' })
  }

  /**
   * Log survey-related events
   */
  survey(event: 'CREATED' | 'UPDATED' | 'PUBLISHED' | 'CLOSED' | 'DELETED', surveyId?: string, context?: LogContext): void {
    this.info(`Survey ${event}`, { surveyId }, { ...context, category: 'survey' })
  }

  /**
   * Log user interaction events
   */
  user(event: 'WALLET_CONNECTED' | 'WALLET_DISCONNECTED' | 'FORM_SUBMITTED' | 'NAVIGATION', context?: LogContext): void {
    this.info(`User ${event}`, undefined, { ...context, category: 'user' })
  }

  /**
   * Log performance metrics
   */
  performance(metric: string, value: number, context?: LogContext): void {
    this.debug(`Performance: ${metric}`, { value, unit: 'ms' }, { ...context, category: 'performance' })
  }

  /**
   * Core logging method
   */
  private log(level: LogLevel, message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level,
      message,
      ...context,
    }

    // Console output with appropriate styling
    const style = this.getLogStyle(level)
    if (this.isDevelopment) {
      console.group(`%c[${level}] ${message}`, style)
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          if (key === 'error' && value instanceof Error) {
            console.error(`${key}:`, value)
          } else {
            console.log(`${key}:`, value)
          }
        })
      }
      console.groupEnd()
    } else {
      // Production logging - could send to external service
      this.sendToExternalService(logEntry)
    }
  }

  /**
   * Get console styling for different log levels
   */
  private getLogStyle(level: LogLevel): string {
    const styles = {
      ERROR: 'color: #ff4444; font-weight: bold',
      WARN: 'color: #ffaa00; font-weight: bold',
      INFO: 'color: #0088ff; font-weight: bold',
      DEBUG: 'color: #888888',
    }
    return styles[level]
  }

  /**
   * Send logs to external service in production
   * This is a placeholder for integration with services like Sentry, LogRocket, etc.
   */
  private sendToExternalService(logEntry: Record<string, unknown>): void {
    // TODO: Implement external logging service integration
    // Example: Sentry, LogRocket, DataDog, etc.
    if (process.env.VITE_LOGGING_SERVICE_URL) {
      // Send to logging service
      void fetch(process.env.VITE_LOGGING_SERVICE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry)
      }).catch(() => {
        // Silently fail for logging service errors
      })
    }
  }
}

// Create singleton logger instance
export const logger = new Logger()

// Convenience functions for common logging patterns
export const logError = (message: string, error?: unknown, context?: LogContext) => {
  logger.error(message, error, context)
}

export const logWarning = (message: string, data?: unknown, context?: LogContext) => {
  logger.warn(message, data, context)
}

export const logInfo = (message: string, data?: unknown, context?: LogContext) => {
  logger.info(message, data, context)
}

export const logDebug = (message: string, data?: unknown, context?: LogContext) => {
  logger.debug(message, data, context)
}

// Transaction logging helpers
export const logTransaction = {
  initiated: (txHash: string, context?: LogContext) => logger.transaction('INITIATED', txHash, context),
  pending: (txHash: string, context?: LogContext) => logger.transaction('PENDING', txHash, context),
  confirmed: (txHash: string, context?: LogContext) => logger.transaction('CONFIRMED', txHash, context),
  failed: (txHash: string, context?: LogContext) => logger.transaction('FAILED', txHash, context),
}

// Survey logging helpers
export const logSurvey = {
  created: (surveyId?: string, context?: LogContext) => logger.survey('CREATED', surveyId, context),
  updated: (surveyId?: string, context?: LogContext) => logger.survey('UPDATED', surveyId, context),
  published: (surveyId?: string, context?: LogContext) => logger.survey('PUBLISHED', surveyId, context),
  closed: (surveyId?: string, context?: LogContext) => logger.survey('CLOSED', surveyId, context),
  deleted: (surveyId?: string, context?: LogContext) => logger.survey('DELETED', surveyId, context),
}

// User interaction logging helpers
export const logUser = {
  walletConnected: (address?: string) => logger.user('WALLET_CONNECTED', { address }),
  walletDisconnected: () => logger.user('WALLET_DISCONNECTED'),
  formSubmitted: (formType: string) => logger.user('FORM_SUBMITTED', { formType }),
  navigation: (from: string, to: string) => logger.user('NAVIGATION', { from, to }),
}

// Performance logging helper
export const logPerformance = (metric: string, startTime: number, context?: LogContext) => {
  const duration = Date.now() - startTime
  logger.performance(metric, duration, context)
}

// Export logger instance as default
export default logger
