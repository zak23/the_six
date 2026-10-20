# Shared work log

Use this folder to coordinate people and agents working from phones, MacBooks or other sessions. GitHub `main` is the shared record. Local files and notes in separate chats do not synchronise across devices. The website's observation form is private browser storage and is not this work log.

## Before starting

1. Read the latest files in [this folder on GitHub](https://github.com/zak23/the_six/tree/main/docs/work-log). Check every task marked `claimed`, `in_progress`, `blocked` or `handoff`; these reserve their listed files until explicitly released.
2. Choose a unique task ID such as `2026-10-20-1030-phone-source-review`. Copy [TEMPLATE.md](TEMPLATE.md) into a new file named after that ID. Use a recognisable session label, such as `phone-agent-a` or `macbook-agent-b`; no personal details are needed.
3. List exact files you intend to edit. **Only one active editor owns `index.html` at a time**, including its embedded data. Researchers can work alongside that editor using separate task files for findings.
4. Publish the claim file to `main` before starting those edits. On a phone, use GitHub's Add file → Create new file. On a MacBook, fetch and inspect the latest `origin/main`, then commit/push only your new claim file from an up-to-date, clean checkout. Keep existing dirty work intact; use a separate checkout if needed. If publishing is unavailable, report that coordination is pending and limit work to reading/planning.
5. Refresh GitHub after publishing and check again for overlapping claims. If two claims overlap, agree an owner and mark the other task `blocked` with its file claim released before either edits. Do not assume the first local timestamp gives ownership.

Claims are a human/agent convention, **not enforced locks**. Separate task files reduce log conflicts; they do not prevent simultaneous claims. Do not start overlapping edits while ownership is unresolved.

## During work and handoff

- Edit only your task record and claimed files. Add newly needed files to your published claim and recheck overlap before editing them.
- Append dated progress events with the action, result and next step. Use ISO timestamps with `+07:00` (Asia/Bangkok), and keep earlier events.
- Keep findings in your task file using the research playbook's intake format. Put reviewed findings into the dataset only through the editor workflow.
- Before merging implementation changes, fetch the latest `main`, inspect intervening changes and reconcile them deliberately. Never force-push, discard unfamiliar local changes or resolve a conflict by replacing the whole file with your version.
- Use a task branch/PR for implementation where possible; identify it in the record. A branch-only claim is insufficient: the claim on `main` must link to that branch/PR. Keep the shared task record current on `main`; do not overwrite newer log events when merging a branch.
- Before pausing or ending a session, publish what changed, checks performed, remaining work and the next action. Record implementation commit SHA(s) and deployment status separately. Use `not checked` when appropriate; a commit is not proof of deployment.
- For a handoff, name the receiving session and obtain acknowledgement before it edits. Mark which files remain reserved or are released. An old timestamp alone does not release ownership: confirm with the owner or project maintainer and log the reassignment.
- On completion, set status to `done` and release all claims. Preserve the record for history. An abandoned task should be marked `cancelled` with a reason and released claims.

Statuses: `claimed`, `in_progress`, `blocked`, `handoff`, `done`, `cancelled`. A blocked/handoff task retains its claims unless its record explicitly releases them. Completed/cancelled tasks reserve no files.

Do not put secrets, private reports or worker/customer identities in logs. Keep research publication/visit dates separate from work-log timestamps.

## Finding current work

Open the folder and read the **Status** and **Claims** of task files (excluding this guide and the template). There is no second manually maintained status table to get out of sync. On a MacBook, `rg -n '^(- Status:|- Claims:|- Owner/session:)' docs/work-log` gives a quick overview; read the full matching records before acting.
