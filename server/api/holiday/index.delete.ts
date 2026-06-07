import SqlHoliday from "~~/server/database/SqlHoliday"

export default authEventHandler(async (event): Promise<any> => {
    const query = getQuery(event)
    return await SqlHoliday.delete(query.comCode!.toString(), query.dateValue)
})