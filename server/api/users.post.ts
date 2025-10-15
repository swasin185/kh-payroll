import type { SchemaTypes } from "~~/shared/utils"
import { Users } from "~~/server/database/Users"
import { authEventHandler } from "~~/server/utils/authEventHandler"

export default authEventHandler(async (event) => {
    const body = await readBody(event)
    const user = body as SchemaTypes["users"]
    if (!user) {
        throw createError({
            statusCode: 400,
            statusMessage: "User ID is required.",
        })
    }
    return await Users.insert(user)
})
