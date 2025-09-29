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
        const result = await Users.delete(userId)
        if (result) {
            setResponseStatus(event, 200)
            return result
        } else {
            throw createError({
                statusCode: 404,
                statusMessage: `Update User with ID '${userId}' not found.`,
            })
        }
    } catch (error) {
        console.error(`Update error in users/[id].get.ts for ID '${userId}':`, error)
        throw createError({
            statusCode: 500,
            statusMessage: (error as Error).message,
        })
    }
})
