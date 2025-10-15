import { Permission } from "~~/server/database/Permission"

export default eventHandler(async (event) => {
    const query = getQuery(event)
    const userId = query.userId!.toString()
    const comCode = query.comCode!.toString()
    return await Permission.select(comCode, userId)
})
