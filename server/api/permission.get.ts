import { sqlPermission } from "~~/server/database/sqlPermission"

export default eventHandler(async (event) => {
    const query = getQuery(event)
    const userId = query.userId!.toString()
    const comCode = query.comCode!.toString()
    return await sqlPermission.select(comCode, userId)
})
