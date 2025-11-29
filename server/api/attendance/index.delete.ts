import SqlAttendance from "~~/server/database/SqlAttendance"

export default authEventHandler(async (event) => {
    const query = getQuery(event)
    return await SqlAttendance.delete(query.comCode!.toString(), query.empCode!.toString(), query.dateTxt!.toString())
})