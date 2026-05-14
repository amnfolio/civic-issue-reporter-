import { db } from '@/db';
import { users, user as authUser } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Get or create an integer user ID for a better-auth string user ID
 * This is a bridge solution for the mismatch between auth users (string IDs) 
 * and the legacy users table (integer IDs)
 * 
 * @param authUserId - String user ID from better-auth
 * @returns Integer user ID from the users table
 */
export async function getOrCreateIntegerUserId(authUserId: string): Promise<number> {
  try {
    // First, get the auth user details
    const authUserRecord = await db
      .select()
      .from(authUser)
      .where(eq(authUser.id, authUserId))
      .limit(1);

    if (authUserRecord.length === 0) {
      console.error('Auth user not found:', authUserId);
      return 1; // Fallback to default user
    }

    const { email, name } = authUserRecord[0];

    // Check if a user with this email exists in the users table
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return existingUser[0].id;
    }

    // Create a new user in the users table
    const newUser = await db
      .insert(users)
      .values({
        email: email,
        name: name,
        role: 'user',
        createdAt: new Date().toISOString(),
      })
      .returning();

    return newUser[0].id;
  } catch (error) {
    console.error('Error in getOrCreateIntegerUserId:', error);
    return 1; // Fallback to default user on error
  }
}

/**
 * Server-side helper to get integer user ID from session
 * Use this in API routes
 */
export async function getUserIdFromSession(authUserId: string | undefined): Promise<number> {
  if (!authUserId) {
    return 1; // Default user
  }

  return getOrCreateIntegerUserId(authUserId);
}
