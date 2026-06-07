import SqlPermission from "~~/server/database/SqlPermission"

export default authEventHandler(async (event): Promise<any> => {
    const query = getQuery(event)
    return await  SqlPermission.used(query.comCode!.toString(), query.userId!.toString(), query.program!.toString())
})
