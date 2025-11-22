import SqlTimeType from "~~/server/database/SqlTimeType"

export default authEventHandler(async (event) => {
    const query = getQuery(event)
    return await SqlTimeType.delete(query.timeCode!.toString())
})