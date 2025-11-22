import SqlHoliday from "~~/server/database/SqlHoliday"

export default authEventHandler(async (event) => {
    const query = getQuery(event)
    return await SqlHoliday.select(query.comCode!.toString(), new Date(query.dateValue!.toString()))
})