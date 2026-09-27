# EchoVerse Database Security Specification

This specification details the database invariants, security assertions, and vulnerability surface tests for the EchoVerse AI platform.

## 1. Data Invariants
- **Identity Integrity**: No user can write a project document with a `uid` that does not match their verified auth UID (`request.auth.uid`).
- **Plan Guard**: A user cannot modify or escalate their own subscription plan status (`plan`) without authorized updates (e.g. mock billing, or plan locked values verified during billing flows).
- **Temporal Stability**: Creation timestamps (`createdAt`) must be bound to the server-verified time (`request.time`) and are immutable.
- **Resource Ownership isolation**: Readers can only view database and project sheets that they specifically own. Sharing is bounded or strictly prohibited at the query level.

## 2. The Dirty Dozen Payloads
Below are 12 specific payloads designed to attempt to bypass identity or schema structures:

1. **Spoofed Owner ID**: `create` project with body `uid: "target_user_id"` hoping rules check isn't comprehensive.
2. **Ghost Field Poisoning**: `create`/`update` project with additional properties like `isAdmin: true` or `shadowField: "payload"`.
3. **Immortality Bypassing**: `update` project with modified `createdAt` in the future.
4. **Subscription Escalation**: `create` user with `plan: "studio"` without correct billing transaction check.
5. **Junk Character Path Variable Injection**: `create` project with a 2MB base64 random sequence as `{projectId}`.
6. **Null Timestamp Spoofing**: `create` document with system timestamps hardcoded to client local times.
7. **Type Poisoning**: `create` project with `inputData: "invalid-string"` instead of a Map record.
8. **Malicious Empty Arrays**: `create` project payload containing empty array sizes of 1000s of elements to exceed Firestore size.
9. **Zero-Verify Email Bypass**: `create` user profile using a spoofed login trace with `email_verified: false` resembling the admin email.
10. **State Shortcutting**: Skipping initialization status keys to set generation is completed.
11. **Malicious Deletion**: Non-owner attempts to run a standard client `delete` call on target projects.
12. **Blanket Query Harvesting**: Executing `collectionGroup` or un-filtered scans to harvest projects from other clients.

## 3. The Target Security Rules
To guard against these 12 attacks, our `firestore.rules` are configured as follows:
- Reject any operation by default (`allow read, write: if false`) unless an explicit match block is hit.
- Verify IDs are clean and under 128 characters.
- Ensure type-validation rules run on both create and update operations.
