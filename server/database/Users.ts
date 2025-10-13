import { useDrizzle } from "./drizzle"
import { users } from "./schema"
import { eq, ne, sql } from "drizzle-orm"
import type { SchemaTypes } from "~~/shared/utils"
import type { LookupItem } from "~~/shared/types"

/**
 * Manages user-related database operations as a static utility.
 * This class should not be instantiated.
 */
export class Users {
    // Private constructor to prevent instantiation, mimicking a static class
    private constructor() {}

    /**
     * Selects a single user by their ID.
     * @param userId The ID of the user to select.
     * @returns The user object or null if not found.
     */
    public static async select(userId: string): Promise<SchemaTypes["users"] | null> {
        const db = useDrizzle()
        const user = await db.query.users.findFirst({
            where: (usersTable) => eq(usersTable.id, userId),
        })
        return user || null
    }

    /**
     * Lookup users list, excluding the 'admin' user.
     * @returns An array of user objects.
     */
    public static async lookup(): Promise<LookupItem[]> {
        const db = useDrizzle()
        const result = await db
            .select({
                id: users.id,
                label: sql`concat(${users.id}, " : ", ${users.name})`,
            })
            .from(users)
            .where(ne(users.id, "admin"))
            .orderBy(users.id)
        return result
    }

    /**
     * Inserts a new user into the database.
     * @param user The user object to insert.
     * @returns True if the user was inserted successfully, false otherwise.
     */
    public static async insert(user: SchemaTypes["users"]): Promise<boolean> {
        const db = useDrizzle()
        user.id = user.id.toLowerCase().trim()
        const result = await db.insert(users).values(user)
        return result[0].affectedRows == 1
    }

    /**
     * Deletes a user from the database by their ID.
     * @param userId The ID of the user to delete.
     * @returns True if the user was deleted successfully, false otherwise.
     */
    public static async delete(userId: string): Promise<boolean> {
        const db = useDrizzle()
        const result = await db.delete(users).where(eq(users.id, userId))
        return result[0].affectedRows == 1
    }

    /**
     * Updates an existing user in the database.
     * @param user The user object with updated fields.
     * @returns True if the user was updated successfully, false otherwise.
     */
    public static async update(user: SchemaTypes["users"]): Promise<boolean> {
        const db = useDrizzle()
        const result = await db.update(users).set(user).where(eq(users.id, user.id))
        return result[0].affectedRows == 1
    }
}
