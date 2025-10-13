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
    return await Users.delete(userId)
})
