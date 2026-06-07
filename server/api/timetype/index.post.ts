import SqlTimeType from "~~/server/database/SqlTimeType"

export default authEventHandler(async (event): Promise<any> => {
    const body = await readBody(event)
    return await SqlTimeType.insert(body)
})