import SqlTimeType from "~~/server/database/SqlTimeType"

export default authEventHandler(async (event) => {
    const body = await readBody(event)
    return await SqlTimeType.update(body)
})