#!/usr/bin/env bash
# =============================================================================
# Poisik — apply pending DB migration: Notification model + onboarding fields
# =============================================================================
#
# CONTEXT
# The migration file already exists and is committed in the repo at:
#   prisma/migrations/20260726090000_add_notifications_and_onboarding/migration.sql
#
# It adds:
#   - 4 nullable DateTime columns on "User" (onboarding tracking)
#   - a new "Notification" table + foreign key + indexes
#
# It has NOT been applied to the real database yet. This script applies it.
# It must be run from a machine with real internet access to the Neon
# database (NOT a restricted sandbox) — the DATABASE_URL host needs to be
# reachable directly.
#
# WHAT TO DO
#   1. Open a terminal.
#   2. cd into the project folder:
#        cd path/to/poisik-design-critic
#   3. Make sure you're on the branch that has this migration (git pull if
#      needed — the file must already exist at the path above).
#   4. Run this script:
#        bash scripts/apply-notifications-onboarding-migration.sh
#
# WHAT IT DOES (in order)
#   1. Sanity-checks the migration file and .env are present.
#   2. Installs dependencies with pnpm (this repo uses pnpm, see
#      pnpm-lock.yaml — do not use npm/yarn install here, it can produce a
#      mismatched lockfile).
#   3. Runs `npx prisma migrate deploy` — this applies any pending
#      migration(s) in prisma/migrations/ to the database defined by
#      DATABASE_URL in .env, and records it in the _prisma_migrations
#      table. It does NOT create new migrations or touch existing data
#      outside of the new columns/table (all new columns are nullable, all
#      new rows come from a new empty table — nothing existing is at risk).
#   4. Regenerates the Prisma client so the app's TypeScript types match
#      the new schema (Notification model, new User fields).
#   5. Runs `npx prisma migrate status` at the end so you can visually
#      confirm there are zero pending migrations left.
#
# If ANYTHING in steps 1-2 fails, STOP and report back — do not force it.
# =============================================================================

set -euo pipefail

MIGRATION_NAME="20260726090000_add_notifications_and_onboarding"
MIGRATION_FILE="prisma/migrations/${MIGRATION_NAME}/migration.sql"

echo "==> [1/5] Checking repo state..."

if [ ! -f "$MIGRATION_FILE" ]; then
  echo "ERROR: $MIGRATION_FILE not found." >&2
  echo "       Are you in the poisik-design-critic root? Did you 'git pull'?" >&2
  exit 1
fi
echo "    OK - migration file found."

if [ ! -f ".env" ]; then
  echo "ERROR: .env not found in current directory." >&2
  echo "       Copy the real .env (with DATABASE_URL) into the repo root first." >&2
  exit 1
fi

if ! grep -q '^DATABASE_URL=' .env; then
  echo "ERROR: .env exists but has no DATABASE_URL line." >&2
  exit 1
fi
echo "    OK - .env with DATABASE_URL found."

echo ""
echo "==> [2/5] Installing dependencies with pnpm..."
if ! command -v pnpm >/dev/null 2>&1; then
  echo "ERROR: pnpm is not installed. Install it first: npm install -g pnpm" >&2
  exit 1
fi
pnpm install

echo ""
echo "==> [3/5] Applying pending migration(s) to the database..."
npx prisma migrate deploy

echo ""
echo "==> [4/5] Regenerating Prisma client..."
npx prisma generate

echo ""
echo "==> [5/5] Verifying final migration status..."
npx prisma migrate status

echo ""
echo "=============================================================="
echo " Done. If 'migrate status' above shows no pending migrations,"
echo " the Notification table and onboarding fields are now live."
echo "=============================================================="
