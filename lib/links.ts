/** The ResCommand app, where accounts, sign-up, billing and log-in live. */
export const APP_URL = 'https://app.rescommand.com'

export const LOGIN_URL = APP_URL

/** Sign-up wizard in the app. `plan` pre-selects Core or Operator on the plan step. */
export function signupUrl(plan?: 'core' | 'operator'): string {
  return plan ? `${APP_URL}/signup?plan=${plan}` : `${APP_URL}/signup`
}
