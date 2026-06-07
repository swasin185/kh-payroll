import SqlHoliday from "~~/server/database/SqlHoliday"

export default authEventHandler(async (event): Promise<any> => {
    const body = await readBody(event)
    return await SqlHoliday.update(body)
})