import SqlPermission from "~~/server/database/SqlPermission"
import type { Permission } from "~~/shared/schema"

export const put = authEventHandler(async (event) => {
    const body = await readBody(event)
    const userId = body.userId
    const comCode = body.comCode
    const permissions = body.permissions as Permission[]
    return SqlPermission.updateAll(comCode, userId, permissions)
})