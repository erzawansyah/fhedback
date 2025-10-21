/**
 * Centralized error handling utilities for the application
 */

import { BaseError } from "viem"

/**
 * Standard error types in the application
 */
export const ErrorType = {
  WALLET_CONNECTION: 'WALLET_CONNECTION',
  SMART_CONTRACT: 'SMART_CONTRACT',
  IPFS_STORAGE: 'IPFS_STORAGE',
  VALIDATION: 'VALIDATION',
  NETWORK: 'NETWORK',
  USER_REJECTED: 'USER_REJECTED',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  UNKNOWN: 'UNKNOWN'
} as const

export type ErrorType = typeof ErrorType[keyof typeof ErrorType]

/**
 * Structured error interface
 */
export interface AppError {
  type: ErrorType
  message: string
  originalError?: unknown
  userMessage: string
  retryable: boolean
}

/**
 * Parse and categorize errors from various sources
 */
export function parseError(error: unknown): AppError {
  // Handle Viem/Wagmi errors
  if (error instanceof BaseError) {
    return parseViemError(error)
  }

  // Handle standard errors
  if (error instanceof Error) {
    return parseStandardError(error)
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      type: ErrorType.UNKNOWN,
      message: error,
      originalError: error,
      userMessage: error,
      retryable: false
    }
  }

  // Fallback for unknown error types
  return {
    type: ErrorType.UNKNOWN,
    message: 'An unexpected error occurred',
    originalError: error,
    userMessage: 'Something went wrong. Please try again.',
    retryable: true
  }
}

/**
 * Parse Viem/Web3 specific errors
 */
function parseViemError(error: BaseError): AppError {
  const errorMessage = error.message.toLowerCase()

  // User rejected transaction
  if (errorMessage.includes('user rejected') || errorMessage.includes('user denied')) {
    return {
      type: ErrorType.USER_REJECTED,
      message: error.message,
      originalError: error,
      userMessage: 'Transaction was cancelled by user',
      retryable: true
    }
  }

  // Insufficient funds
  if (errorMessage.includes('insufficient funds') || errorMessage.includes('insufficient balance')) {
    return {
      type: ErrorType.INSUFFICIENT_FUNDS,
      message: error.message,
      originalError: error,
      userMessage: 'Insufficient funds to complete this transaction',
      retryable: false
    }
  }

  // Network errors
  if (errorMessage.includes('network') || errorMessage.includes('connection')) {
    return {
      type: ErrorType.NETWORK,
      message: error.message,
      originalError: error,
      userMessage: 'Network connection error. Please check your connection and try again.',
      retryable: true
    }
  }

  // Smart contract execution errors
  if (errorMessage.includes('execution reverted') || errorMessage.includes('revert')) {
    return {
      type: ErrorType.SMART_CONTRACT,
      message: error.message,
      originalError: error,
      userMessage: 'Smart contract error. Please check your transaction parameters.',
      retryable: false
    }
  }

  // Default Web3 error
  return {
    type: ErrorType.SMART_CONTRACT,
    message: error.message,
    originalError: error,
    userMessage: 'Transaction failed. Please try again.',
    retryable: true
  }
}

/**
 * Parse standard JavaScript errors
 */
function parseStandardError(error: Error): AppError {
  const errorMessage = error.message.toLowerCase()

  // Wallet connection errors
  if (errorMessage.includes('wallet') || errorMessage.includes('connect')) {
    return {
      type: ErrorType.WALLET_CONNECTION,
      message: error.message,
      originalError: error,
      userMessage: 'Please connect your wallet to continue',
      retryable: true
    }
  }

  // IPFS/Storage errors
  if (errorMessage.includes('ipfs') || errorMessage.includes('storage') || errorMessage.includes('upload')) {
    return {
      type: ErrorType.IPFS_STORAGE,
      message: error.message,
      originalError: error,
      userMessage: 'Failed to save data. Please try again.',
      retryable: true
    }
  }

  // Validation errors
  if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
    return {
      type: ErrorType.VALIDATION,
      message: error.message,
      originalError: error,
      userMessage: error.message, // Show validation errors directly to user
      retryable: false
    }
  }

  // Default error
  return {
    type: ErrorType.UNKNOWN,
    message: error.message,
    originalError: error,
    userMessage: error.message || 'An unexpected error occurred',
    retryable: true
  }
}

/**
 * Get appropriate user-facing error message
 */
export function getUserErrorMessage(error: unknown): string {
  const parsedError = parseError(error)
  return parsedError.userMessage
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  const parsedError = parseError(error)
  return parsedError.retryable
}

/**
 * Log error for debugging (only in development)
 */
export function logError(error: unknown, context?: string): void {
  if (process.env.NODE_ENV === 'development') {
    const parsedError = parseError(error)
    console.group(`🚨 Error${context ? ` in ${context}` : ''}`)
    console.error('Type:', parsedError.type)
    console.error('Message:', parsedError.message)
    console.error('User Message:', parsedError.userMessage)
    console.error('Retryable:', parsedError.retryable)
    console.error('Original Error:', parsedError.originalError)
    console.groupEnd()
  }
}

/**
 * Create a standardized error for common scenarios
 */
export const createError = {
  walletNotConnected: (): AppError => ({
    type: ErrorType.WALLET_CONNECTION,
    message: 'Wallet not connected',
    userMessage: 'Please connect your wallet to continue',
    retryable: true
  }),

  invalidInput: (message: string): AppError => ({
    type: ErrorType.VALIDATION,
    message,
    userMessage: message,
    retryable: false
  }),

  networkError: (): AppError => ({
    type: ErrorType.NETWORK,
    message: 'Network connection failed',
    userMessage: 'Network error. Please check your connection and try again.',
    retryable: true
  }),

  contractError: (message?: string): AppError => ({
    type: ErrorType.SMART_CONTRACT,
    message: message || 'Contract execution failed',
    userMessage: 'Transaction failed. Please try again.',
    retryable: true
  })
}
