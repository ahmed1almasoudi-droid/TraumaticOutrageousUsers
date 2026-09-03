---
name: Expo GitHub pnpm builds
description: Expo GitHub builds can use an older pnpm than the Replit workspace.
---

When an Expo GitHub build reports that pnpm-lock.yaml is incompatible and then says the lockfile is absent, check the builder's pnpm generation before changing app code. A pnpm v6 lockfile with explicit dependency ranges may be needed for the cloud builder, while the Replit preview can continue using its installed pnpm.

**Why:** The cloud builder may ignore a newer lockfile format before dependency installation, causing a misleading no-lockfile error.

**How to apply:** Keep the app base directory pointed at its workspace subdirectory, verify the lockfile with the builder-compatible pnpm using --frozen-lockfile, and do not treat this as an Android credentials problem until dependency installation passes.