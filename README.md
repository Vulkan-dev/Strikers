# STR Clan Identity & Verification Portal

A clean, minimalist, professional verification intake and moniker generator for STR clan management.

## Features & Security
- **Discord User Identity Verification & Legitimacy Gate**:
  - Live Discord User ID (Snowflake) verification.
  - Interactive **Discord Profile Card** preview displaying Avatar, Avatar Decoration, Display Name, Handle, Account Badges, Creation Date, and Legitimacy status.
  - **Strict Legitimacy Gate**: Enforces a minimum account age of **3 months (90 days)** calculated from Discord Snowflake epoch. Accounts younger than 90 days are blocked from submitting to prevent alt and burner accounts.
- **Bot Embed & Automated Category Channel Creation**:
  - Integrates directly with the **Strikers Bot API** (`/api/clan/apply`).
  - Bot automatically creates a private verification intake channel (`verify-{username}`) under the selected Discord category.
  - Sends a bot embed with applicant answers, Discord profile preview, and staff review buttons (`[Approve Applicant]`, `[Reject & Close]`).
  - Includes a fallback webhook in case the bot API is temporarily unreachable.
- **Protected Moniker Generator**:
  - Requires explicit confirmation via security modal.
  - Enforces a 30-day anti-abuse lock per user to prevent duplicate or infinite name creation.
- **Aesthetic**:
  - 100% matte near-black achromatic design with interactive fluid canvas background.
