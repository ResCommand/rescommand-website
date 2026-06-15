## Description

<!-- Brief description of what this PR changes and why -->

## Type of change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Refactor / cleanup (no functional changes)

## Checklist

- [ ] Code passes `next lint` with no errors
- [ ] All tests pass (`npx jest --forceExit`)
- [ ] Build succeeds (`npm run build`)
- [ ] If touching auth/session: verified login works and sidebar renders for all roles (EMPLOYEE, MANAGER, OWNER, PLATFORM_ADMIN)
- [ ] If touching DB schema: created a Prisma migration (not raw SQL)
- [ ] If adding env vars: registered them via the env key system (not hardcoded)
- [ ] If adding a background service: uses a production command (not `npm run dev`)
- [ ] No secrets, API keys, or credentials committed to source

## Testing

<!-- How did you verify this works? What did you test? -->

## Screenshots (if applicable)

<!-- For UI changes, include before/after screenshots -->
