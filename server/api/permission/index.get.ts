import SqlPermission from "~~/server/database/SqlPermission"

export default authEventHandler(async (event) => {
    const query = getQuery(event)
    return await SqlPermission.select(query.comCode!.toString(), query.userId!.toString())
})