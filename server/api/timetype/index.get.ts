import SqlTimeType from "~~/server/database/SqlTimeType"

export default authEventHandler(async (event): Promise<any> => {
    const query = getQuery(event)
    return await SqlTimeType.select(query.timeCode!.toString())
})
