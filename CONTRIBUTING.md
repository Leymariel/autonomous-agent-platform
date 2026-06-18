# Contributing — Engineering Workflow

> **This file is mandatory reading for every agent before starting any task.**  
> Every rule here is enforced. The QA loop is non-negotiable.

---

## Branch Naming

Every code change starts from a branch. Never commit directly to `main`.

```
{agent_id}/{short-description}
```

| Agent | Example branch |
|-------|---------------|
| `frontend_engineer` | `frontend_engineer/onboarding-wizard` |
| `design_engineer` | `design_engineer/landing-page-reactbits` |
| `runtime_engineer` | `runtime_engineer/policy-engine-rules` |
| `integrations_engineer` | `integrations_engineer/gmail-send-tool` |
| `devops_engineer` | `devops_engineer/db-migration-v2` |
| `qa_reviewer` | `qa_reviewer/e2e-auth-flow` |
| `security_reviewer` | `security_reviewer/oauth-scope-audit` |

**Rules:** lowercase, hyphens only, 2–4 words.

```bash
git checkout main && git pull
git checkout -b {agent_id}/{branch-name}
```

---

## Pull Requests

Every PR must include this description template — **no exceptions**:

```markdown
## Summary
<!-- What does this PR do? 1–3 sentences, plain English. -->

## Changes
<!-- Every file changed and what was done. -->
- `src/app/page.tsx` — redesigned hero section
- `src/components/ui/button.tsx` — added `ghost` variant

## How to test
<!-- Step-by-step for QA. Be specific. Include URLs. -->
1. Go to https://autonomous-agent-platform-nine.vercel.app/sign-in
2. Click "Continue with Google"
3. Expect: redirects to Google OAuth consent screen

## Checklist
- [ ] Tested on live preview URL
- [ ] No console errors
- [ ] No regressions on existing pages
- [ ] Mobile viewport checked (if UI change)
```

---

## The QA Loop — Non-Negotiable

Every PR must complete **exactly one** of these three outcomes before it can merge:

### ✅ Outcome 1 — QA Passes
QA agent tested everything in the "How to test" section. All pass.

**Action:** Leave review comment `✅ QA PASSED — [what was tested]`, approve PR, merge.

---

### ❌ Outcome 2 — QA Fails
Something didn't work as described.

**Action:** Leave review comment with:
```
❌ QA FAILED
Issue: [exact failure — what happened vs what was expected]
Steps to reproduce: [step-by-step]
Assigned back to: {agent_id}
```
Request changes. Do NOT merge. The authoring agent must fix and re-request review.

---

### ⚠️ Outcome 3 — QA Cannot Test
The change requires something QA can't access: real OAuth, live email, payment flow, hardware, etc.

**Action:**
1. Leave review comment: `⚠️ MANUAL REVIEW REQUIRED — [exact reason QA cannot test this]`
2. **Immediately message Atlas (the orchestrator)** with:
   - PR link
   - What needs to be tested
   - What to look for / expected outcome
3. Atlas will notify Lawrence directly.

**The QA loop is only closed when Lawrence confirms the result.**

---

## The Loop Must Always Close

QA agents: you cannot go silent. Every PR you are assigned must end in one of the three outcomes above. If you get stuck, blocked, or unsure — that is Outcome 3. Message Atlas. Never leave a PR in limbo.

Authoring agents: if your PR has been in review for more than 30 minutes with no outcome, ping Atlas.

---

## Merge Rules

- ✅ QA approval required before any merge
- No force pushes to `main`
- No direct commits to `main`  
- Merging `main` → automatic Vercel production deploy (monitor it)
- If deploy errors after merge: the merging agent owns the hotfix

---

## Hotfixes

For critical production issues (broken auth, 500 errors, data loss):

```
hotfix/{agent_id}/{issue}
```

15-minute QA window. Message Atlas immediately. Atlas notifies Lawrence.

---

## Level 5 — Always Requires Lawrence's Approval

Never do these without explicit human sign-off:
- Connect real OAuth accounts
- Send real emails or messages on behalf of a user
- Spend money or trigger billing
- Delete production data
- Deploy outside the normal PR flow

---

## Checklist Before Opening a PR

- [ ] Branch named correctly: `{agent_id}/{description}`
- [ ] PR description filled out completely (all 4 sections)
- [ ] "How to test" steps are specific enough that QA can follow them without asking questions
- [ ] All existing tests still pass (run `npm run test:e2e` if possible)
- [ ] No secrets or credentials in the diff
