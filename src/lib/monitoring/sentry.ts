/**
 * Sentry Error Monitoring Configuration
 * Production-ready error tracking and performance monitoring
 */

import * as Sentry from '@sentry/nextjs';

export function initSentry() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      debug: process.env.NODE_ENV === 'development',

      // Performance monitoring
      enabled: process.env.NODE_ENV === 'production',

      // Error filtering
      beforeSend(event, hint) {
        // Filter out non-critical errors in development
        if (process.env.NODE_ENV === 'development') {
          console.log('Sentry Event:', event);
        }

        // Don't send errors from localhost in production builds
        if (process.env.NODE_ENV === 'production' && event.exception) {
          const error = hint.originalException;
          if (error && typeof error === 'object' && 'message' in error) {
            const message = (error as Error).message;
            if (message.includes('Network Error') || message.includes('fetch')) {
              return null; // Don't report network errors
            }
          }
        }

        return event;
      },

      // Release tracking
      release: process.env.VERCEL_GIT_COMMIT_SHA,

      // Integrations are automatically configured for Next.js
      // BrowserTracing and Feedback are included by default in @sentry/nextjs
    });
  }
}

/**
 * Capture exception with context
 */
export function captureException(error: Error, context?: any) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setContext('additional_info', context);
      }
      Sentry.captureException(error);
    });
  } else {
    console.error('Sentry not configured, logging error:', error, context);
  }
}

/**
 * Capture message with level
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureMessage(message, level);
  } else {
    console.log(`Sentry not configured, logging message (${level}):`, message);
  }
}

/**
 * Set user context for error tracking
 */
export function setUserContext(user: { id: string; email: string; name?: string }) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
    });
  }
}

/**
 * Clear user context
 */
export function clearUserContext() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.setUser(null);
  }
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message: string, category: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.addBreadcrumb({
      message,
      category,
      level,
      timestamp: Date.now() / 1000,
    });
  }
}

export default {
  initSentry,
  captureException,
  captureMessage,
  setUserContext,
  clearUserContext,
  addBreadcrumb,
};