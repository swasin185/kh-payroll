import type { SchemaTypes } from "~~/shared/types"
import { Users } from "~~/server/database/Users"
import { authEventHandler } from "~~/server/utils/authEventHandler"

export default authEventHandler(async (event) => {
    const body = await readBody(event)
    const user = body as SchemaTypes["users"]
    if (!user) {
        throw createError({
            status: 400,
            message: "User ID is required.",
        })
    }
    return await Users.update(user)
})
