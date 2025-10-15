import type { SchemaTypes } from "~~/shared/utils"
import { Permission } from "~~/server/database/Permission"
import { authEventHandler } from "~~/server/utils/authEventHandler"

export default authEventHandler(async (event) => {
    const body = await readBody(event)
    const userId = body.userId
    const comCode = body.comCode
    const permissions = body.permissions as SchemaTypes["permission"][]
    if (!permissions || !userId || !comCode ) {
        throw createError({
            status: 400,
            message: "User ID is required.",
        })
    }
    return Permission.updateAll(comCode, userId, permissions)
})
