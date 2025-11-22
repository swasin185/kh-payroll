import SqlHoliday from "~~/server/database/SqlHoliday"

export default authEventHandler(async (event) => {
    const body = await readBody(event)
    return await SqlHoliday.insert(body)
})