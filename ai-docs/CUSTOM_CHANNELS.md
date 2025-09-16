# Custom Channels Guide

## What Are Custom Channels?

Custom channels in EAS Updates allow you to create isolated update streams for specific purposes beyond the standard development/staging/production workflow.

## When to Use Custom Channels

### 1. **Feature Branches** 🌿
Test new features in isolation before merging to main branches.

```bash
bun build → Staging → Custom channel → "feature-payment"
bun ota → Custom channel → "feature-payment"
```

**Example channels:**
- `feature-payment`
- `feature-auth`
- `feature-new-ui`

### 2. **A/B Testing** 🧪
Deploy different versions to compare performance or user preference.

```bash
# Version A (control)
bun ota → staging

# Version B (experiment)
bun ota → Custom channel → "experiment-v2"
```

**Example channels:**
- `experiment-v2`
- `new-checkout-flow`
- `simplified-onboarding`

### 3. **Beta Testing Groups** 👥
Give early access to specific user groups.

```bash
bun build → Staging → Custom channel → "beta-testers"
bun ota → Custom channel → "beta-testers"
```

**Example channels:**
- `beta-testers`
- `early-access`
- `vip-users`
- `internal-team`

### 4. **Regional Rollouts** 🌍
Deploy updates to specific regions first.

```bash
bun ota → Custom channel → "us-west"
# Test in US West first

bun ota → Custom channel → "eu-central"
# Then roll out to Europe
```

**Example channels:**
- `us-west`
- `us-east`
- `eu-central`
- `asia-pacific`

### 5. **Gradual Rollouts** 📊
Control the percentage of users receiving updates.

```bash
bun ota → Custom channel → "10-percent"
# Monitor metrics

bun ota → Custom channel → "50-percent"
# If stable, increase

bun ota → production
# Full rollout
```

**Example channels:**
- `10-percent`
- `25-percent`
- `50-percent`
- `canary`

## How to Use Custom Channels

### Step 1: Build with Custom Channel
```bash
bun build
→ Staging
→ Use custom channel? → Yes
→ "feature-xyz"
```

### Step 2: Push Updates to Custom Channel
```bash
bun ota
→ Custom Channel...
→ "feature-xyz"
```

### Step 3: Test with Specific Testers
Share the build with testers who need that specific feature/version.

## Best Practices

### Naming Conventions

Use descriptive, hyphenated names:
- ✅ `feature-payment-v2`
- ✅ `beta-testers-ios`
- ✅ `experiment-new-onboarding`
- ❌ `test1`
- ❌ `xyz`

### Channel Lifecycle

1. **Create**: When starting a new feature/experiment
2. **Update**: Push OTA updates during development
3. **Merge**: After testing, merge changes to main branch
4. **Archive**: Stop using the channel after feature is complete

### Documentation

Always document:
- Purpose of the custom channel
- Who has access
- When it was created
- When to deprecate

### Security Considerations

- Custom channels are still visible in your EAS dashboard
- Don't include sensitive information in channel names
- Use proper access controls for internal testing

## Common Scenarios

### Scenario: Testing Payment Feature
```bash
# 1. Build with custom channel
bun build → Staging → Custom → "feature-payment"

# 2. Share with payment team
# 3. Iterate with OTA updates
bun ota → Custom → "feature-payment"

# 4. Once approved, rebuild for staging
bun build → Staging → Standard channel
```

### Scenario: A/B Testing New UI
```bash
# Control group (existing UI)
bun ota → staging

# Test group (new UI)
bun build → Staging → Custom → "new-ui-test"
bun ota → Custom → "new-ui-test"

# Compare metrics between channels
```

### Scenario: Emergency Hotfix Testing
```bash
# Create hotfix channel
bun ota → Custom → "hotfix-crash-fix"

# Test with internal team first
# If successful, push to production
bun ota → production
```

## Channel Management

### View Updates for Custom Channel
```bash
bun ota
→ View update history
→ "feature-payment"
```

### Rollback Custom Channel
```bash
bun ota
→ Rollback to previous
→ Custom → "feature-payment"
```

## Tips

1. **Clean Up**: Don't leave too many unused custom channels
2. **Communicate**: Tell your team which channels are active
3. **Test First**: Always test on custom/staging before production
4. **Monitor**: Watch crash reports and analytics per channel
5. **Document**: Keep a log of what each custom channel is for

## Summary

Custom channels provide flexibility for:
- **Isolated testing** without affecting main channels
- **Gradual rollouts** to minimize risk
- **Parallel development** of multiple features
- **A/B testing** different approaches
- **Emergency fixes** with controlled distribution

Use them when the standard dev/staging/prod flow isn't enough!
