import SqlPermission from "~~/server/database/SqlPermission"

export default authEventHandler(async (event) => {
    const query = getQuery(event)
    const session = await getUserSession(event)
    const userId = (session.user as any).id
    const comCode = (session.user as any).comCode
    const program = query.program?.toString()
    return await  SqlPermission.used(comCode, userId, program!)
})
