import SqlPermission from "~~/server/database/SqlPermission"

export default authEventHandler(async (event) => {
    const query = getQuery(event)
    const userId = query.userId!.toString()
    const comCode = query.comCode!.toString()
    return await SqlPermission.select(comCode, userId)
})