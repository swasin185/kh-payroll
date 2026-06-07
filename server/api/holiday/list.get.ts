import SqlHoliday from "~~/server/database/SqlHoliday"

export default authEventHandler(async (event): Promise<any> => {
    const query = getQuery(event)
    return await SqlHoliday.list(
        query.comCode!.toString(),
        new Date(query.startDate!.toString()),
        new Date(query.endDate!.toString())
    )
})
