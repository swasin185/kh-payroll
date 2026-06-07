import SqlPermission from "~~/server/database/SqlPermission"
import { type Permission } from "~~/shared/schema"

export default authEventHandler(async (event): Promise<any> => {
    const body = await readBody(event)
    console.log("permission put", body)
    return SqlPermission.updateAll(
        body.comCode, 
        body.userId, 
        body.permissions as Permission[])
})