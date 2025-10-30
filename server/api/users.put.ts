import { sqlUsers } from "~~/server/database/sqlUsers"
import { authEventHandler } from "~~/server/utils/authEventHandler"
import type { Users } from "~~/shared/schema"

export default authEventHandler(async (event) => {
    const body = await readBody(event)
    const user = body as Users
    if (!user) {
        throw createError({
            status: 400,
            message: "User ID is required.",
        })
    }
    return await sqlUsers.update(user)
})
