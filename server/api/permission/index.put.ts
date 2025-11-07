import SqlPermission from "~~/server/database/SqlPermission"
import type { Permission } from "~~/shared/schema"

export const put = authEventHandler(async (event) => {
    const body = await readBody(event)
    return SqlPermission.updateAll(
        body.comCode, 
        body.userId, 
        body.permissions as Permission[])
})