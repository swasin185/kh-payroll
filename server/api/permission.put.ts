import { authEventHandler } from "~~/server/utils/authEventHandler"
import { sqlPermission } from "~~/server/database/sqlPermission"
import type { Permission } from "~~/shared/schema"

export default authEventHandler(async (event) => {
    const body = await readBody(event)
    const userId = body.userId
    const comCode = body.comCode
    const permissions = body.permissions as Permission[]
    if (!permissions || !userId || !comCode ) {
        throw createError({
            status: 400,
            message: "User ID is required.",
        })
    }
    return sqlPermission.updateAll(comCode, userId, permissions)
})
