import { Permission } from "~~/server/database/Permission"

export default eventHandler(async (event) => {
    const query = getQuery(event)
    const session = await getUserSession(event)
    const userId = (session.user as any).id
    const comCode = (session.user as any).comCode
    const program = query.program?.toString()
    return await Permission.used(comCode, userId, program!)
})
