import { authEventHandler } from "~~/server/utils/authEventHandler"
import { sqlUsers } from "~~/server/database/sqlUsers"

export default authEventHandler(async (event) => {
    const query = getQuery(event)
    const userId = query.id?.toString().toLowerCase()
    if (!userId) {
        throw createError({
            statusCode: 400,
            statusMessage: "User ID is required.",
        })
    }
    return await sqlUsers.delete(userId)
})
