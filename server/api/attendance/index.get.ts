import SqlAttendance from "~~/server/database/SqlAttendance"

export default authEventHandler(async (event) => {
    const query = getQuery(event)
    return await SqlAttendance.select(query.comCode!.toString(), query.empCode!.toString(), query.fromDate!.toString(), query.toDate!.toString())
})
