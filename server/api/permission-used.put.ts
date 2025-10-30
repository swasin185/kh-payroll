import { sqlPermission } from "~~/server/database/sqlPermission"

export default eventHandler(async (event) => {
    const query = getQuery(event)
    const session = await getUserSession(event)
    const userId = (session.user as any).id
    const comCode = (session.user as any).comCode
    const program = query.program?.toString()
    return await  sqlPermission.used(comCode, userId, program!)
})
