import { SchemaTypes } from "~~/server/database/drizzle"
import { Users } from "~~/server/database/Users"
import { authEventHandler } from "~~/server/utils/authEventHandler"

export default authEventHandler(async (event) => {
    const query = getQuery(event)
    const user = query as SchemaTypes["users"]
    if (!user) {
        throw createError({
            status: 400,
            message: "User ID is required.",
        })
    }
    try {
        const result = await Users.update(user)
        if (result) {
            setResponseStatus(event, 200) // OK
            return result
        } else {
            throw createError({
                status: 404,
                message: `Update User with ID '${user.id}' not found.`,
            })
        }
    } catch (error) {
        console.error(`Update error in users/[id].get.ts for ID '${user.id}':`, error)
        throw createError({
            status: 500,
            message: (error as Error).message,
        })
    }
})
