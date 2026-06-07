import SqlEmployee from "~~/server/database/SqlEmployee"

export default authEventHandler(async (event): Promise<any> => {
    const query = getQuery(event)
    const comCode = query.comCode?.toString()
    if (!comCode) throw createError({ statusCode: 400, statusMessage: "Missing comCode" })

    const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100)
    const offset = Math.max(Number(query.offset) || 0, 0)
    const search = query.search?.toString() || undefined

    return await SqlEmployee.list(comCode, limit, offset, search)
})
