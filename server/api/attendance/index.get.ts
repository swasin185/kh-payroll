import SqlAttendance from "~~/server/database/SqlAttendance"

export default authEventHandler(async (event): Promise<any> => {
    const query = getQuery(event)
    return await SqlAttendance.select(query.comCode!.toString(), query.empCode!.toString(), query.fromDate!.toString(), query.toDate!.toString())
})
