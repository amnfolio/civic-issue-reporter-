# User ID Mismatch Issue - Fix Guide

## The Problem

The application has **two separate user tables** with different ID types:

1. **`user` table** (better-auth) - Uses **string IDs** (e.g., "abc123xyz")
2. **`users` table** (legacy/demo) - Uses **integer IDs** (e.g., 1, 2, 3)

The `issues` table references the integer-based `users` table, but the authentication system (better-auth) returns string-based user IDs. This causes the error:

```
"userId must be a valid number"
```

## Current Temporary Fix

The report page now attempts to parse the string ID as an integer, and falls back to user ID `1` if parsing fails:

```typescript
const userIdNumber = session?.user?.id ? parseInt(session.user.id) : 1;
const userId = isNaN(userIdNumber) ? 1 : userIdNumber;
```

**Limitation**: This means all users will create issues under the same integer user ID, losing proper user attribution.

## Permanent Solutions

### Option 1: User Mapping Table (Recommended)

Create a mapping table between auth users and integer users:

```sql
CREATE TABLE user_mapping (
  auth_user_id TEXT PRIMARY KEY,  -- from 'user' table
  legacy_user_id INTEGER,          -- from 'users' table
  FOREIGN KEY (auth_user_id) REFERENCES user(id),
  FOREIGN KEY (legacy_user_id) REFERENCES users(id)
);
```

### Option 2: Consolidate User Tables

Migrate everything to use the better-auth `user` table:

1. Update `issues` table to use TEXT for `userId`:
   ```sql
   ALTER TABLE issues ALTER COLUMN user_id TYPE TEXT;
   ```

2. Migrate existing data
3. Update all foreign key references
4. Remove the legacy `users` table

### Option 3: Sequential ID Generation

When a new user signs up via better-auth:
1. Create a corresponding entry in the `users` table with auto-increment ID
2. Store this integer ID in the auth user's metadata or a mapping table
3. Use this integer ID when creating issues

## Implementation Steps for Option 1

1. Create migration to add `user_mapping` table
2. Add a signup hook to create mapping entries
3. Create a helper function:
   ```typescript
   async function getIntegerUserId(authUserId: string): Promise<number> {
     // Check mapping table
     // If not found, create new users entry and mapping
     // Return integer ID
   }
   ```
4. Update report page to use this helper
5. Update other areas that create issues

## Files Affected

- `/src/app/report/page.tsx` - Issue creation form
- `/src/app/api/issues/route.ts` - Issue API validation
- `/src/db/schema.ts` - Database schema
- All components that display user information with issues

## Testing Checklist

After implementing the permanent fix:

- [ ] New users can report issues with correct attribution
- [ ] Existing issues maintain their user associations
- [ ] Admin dashboard shows correct user information
- [ ] User profile shows their own issues correctly
- [ ] Vote tracking works with correct user IDs
- [ ] Notifications are sent to correct users

## Quick Fix for Development

For immediate development/testing, you can:

1. Use the same email for both tables
2. Manually sync user data between tables
3. Use a consistent numeric ID pattern (e.g., hash the string ID to a number)

## Related Files

- `src/db/schema.ts` - Schema definitions
- `src/db/seeds/users.ts` - Seed data for integer users table
- `src/lib/auth.ts` - Better-auth configuration
- `src/app/api/issues/route.ts` - Issue API endpoints
