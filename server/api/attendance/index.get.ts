import SqlAttendance from "~~/server/database/SqlAttendance"

export default authEventHandler(async (event) => {
    const query = getQuery(event)
    return await SqlAttendance.select(query.comCode!.toString(), query.empCode!.toString(), query.toDate!.toString(), query.fromDate!.toString())
})
