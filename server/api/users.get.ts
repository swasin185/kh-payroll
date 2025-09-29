import { Users } from "~~/server/database/Users"
import { authEventHandler } from "~~/server/utils/authEventHandler"

export default authEventHandler(async (event) => {
    const query = getQuery(event)
    const userId = query.id?.toString().toLowerCase()
    if (!userId) {
        throw createError({
            statusCode: 400,
            statusMessage: "User ID is required.",
        })
    }
    try {
        const user = await Users.select(userId)
        if (user) {
            return user
        } else {
            throw createError({
                statusCode: 404,
                statusMessage: `User with ID '${userId}' not found.`,
            })
        }
    } catch (error) {
        console.error(`Database query error in user.get.ts for ID '${userId}':`, error)
        throw createError({
            statusCode: 500,
            statusMessage: (error as Error).message,
        })
    }
})
