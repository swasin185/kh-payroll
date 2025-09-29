import { useDrizzle, SchemaTypes } from "./drizzle"
import { users } from "./schema"
import { eq, ne } from "drizzle-orm" // Assuming these are from drizzle-orm

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
        try {
            const user = await db.query.users.findFirst({
                where: (usersTable) => eq(usersTable.id, userId),
            })
            return user || null
        } catch (error) {
            console.error(`Database query error in User.selectUserBy for ID '${userId}':`, error)
            throw new Error(`Failed to fetch user: ${(error as Error).message}`)
        }
    }

    /**
     * Selects all users, excluding the 'admin' user.
     * @returns An array of user objects.
     */
    public static async selectAll(): Promise<SchemaTypes["users"][]> {
        const db = useDrizzle()
        try {
            const users = await db.query.users.findMany({
                where: (usersTable) => ne(usersTable.id, "admin"),
                orderBy: (usersTable) => usersTable.id,
            })
            return users
        } catch (error) {
            console.error(`Database query error in User.select:`, error)
            throw new Error(`Failed to fetch user list: ${(error as Error).message}`)
        }
    }

    /**
     * Inserts a new user into the database.
     * @param user The user object to insert.
     * @returns True if the user was inserted successfully, false otherwise.
     */
    public static async insert(user: SchemaTypes["users"]): Promise<boolean> {
        const db = useDrizzle()
        user.id = user.id.toLowerCase().trim()
        try {
            const result = await db.insert(users).values(user)
            return result[0].affectedRows == 1
        } catch (error) {
            if ((error as any).code === "ER_DUP_ENTRY") {
                throw new Error(`User with ID '${user.id}' already exists.`)
            }
            throw new Error(`Failed to insert user: ${(error as Error).message}`)
        }
    }

    /**
     * Deletes a user from the database by their ID.
     * @param userId The ID of the user to delete.
     * @returns True if the user was deleted successfully, false otherwise.
     */
    public static async delete(userId: string): Promise<boolean> {
        const db = useDrizzle()
        try {
            const result = await db.delete(users).where(eq(users.id, userId))
            return result[0].affectedRows == 1
        } catch (error) {
            throw new Error(`Failed to delete user: ${(error as Error).message}`)
        }
    }

    /**
     * Updates an existing user in the database.
     * @param user The user object with updated fields.
     * @returns True if the user was updated successfully, false otherwise.
     */
    public static async update(user: SchemaTypes["users"]): Promise<boolean> {
        const db = useDrizzle()
        try {
            const result = await db
                .update(users)
                .set(user)
                .where(eq(users.id, user.id))
            return result[0].affectedRows == 1
        } catch (error) {
            throw new Error(`Failed to update user: ${(error as Error).message}`)
        }
    }
}
