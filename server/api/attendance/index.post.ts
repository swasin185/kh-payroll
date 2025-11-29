import SqlAttendance from "~~/server/database/SqlAttendance"

export default authEventHandler(async (event) => {
    const body = await readBody(event)
    return await SqlAttendance.insert(body)
})