import posthog from 'posthog-js'

let initialized = false

export const AnalyticsEvents = {
  LANDING_VIEWED: 'landing_viewed',
  CTA_CLICKED: 'cta_clicked',
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_STEP_COMPLETED: 'onboarding_step_completed',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  SIGNUP_STARTED: 'signup_started',
  SIGNUP_COMPLETED: 'signup_completed',
  CHECKIN_COMPLETED: 'checkin_completed',
  JOURNAL_ENTRY_SAVED: 'journal_entry_saved',
  PROTOCOL_OPENED: 'protocol_opened',
  PREMIUM_CHECKOUT_CLICKED: 'premium_checkout_clicked',
  PREMIUM_CONVERTED: 'premium_converted',
} as const

export function initAnalytics() {
  const key = import.meta.env.VITE_POSTHOG_KEY
  if (!key || initialized) return

  posthog.init(key, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://eu.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false,
    capture_pageleave: true,
    persistence: 'localStorage+cookie',
  })
  initialized = true
}

export function track(event: string, properties?: Record<string, unknown>) {
  if (!import.meta.env.VITE_POSTHOG_KEY) return
  posthog.capture(event, properties)
}

export function trackPageView(path: string) {
  if (!import.meta.env.VITE_POSTHOG_KEY) return
  posthog.capture('$pageview', {
    $current_url: `${window.location.origin}${path}`,
  })
}

export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (!import.meta.env.VITE_POSTHOG_KEY) return
  posthog.identify(userId, properties)
}

export function resetUser() {
  if (!import.meta.env.VITE_POSTHOG_KEY) return
  posthog.reset()
}

export function trackSignupIfNew(userId: string, createdAt: Date | null | undefined) {
  const key = `aster_tracked_signup_${userId}`
  if (localStorage.getItem(key)) return

  const isNew = createdAt && Date.now() - createdAt.getTime() < 10 * 60 * 1000
  if (isNew) {
    track(AnalyticsEvents.SIGNUP_COMPLETED)
  }
  localStorage.setItem(key, '1')
}
