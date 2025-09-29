import { SchemaTypes } from "~~/server/database/drizzle"
import { Users } from "~~/server/database/Users"
import { authEventHandler } from "~~/server/utils/authEventHandler"

export default authEventHandler(async (event) => {
    const query = getQuery(event)
    const user = query as SchemaTypes["users"]
    if (!user) {
        throw createError({
            statusCode: 400,
            statusMessage: "User ID is required.",
        })
    }
    try {
        const result = await Users.insert(user)
        if (result) {
            setResponseStatus(event, 200) // OK
            return result
        } else {
            throw createError({
                statusCode: 404,
                statusMessage: `Update User with ID '${user.id}' not found.`,
            })
        }
    } catch (error) {
        console.error(`Database query error in users/[id].get.ts for ID '${user}':`, error)
        throw createError({
            statusCode: 500,
            statusMessage: (error as Error).message,
        })
    }
})
