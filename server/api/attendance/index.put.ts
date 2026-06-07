import SqlAttendance from "~~/server/database/SqlAttendance"

export default authEventHandler(async (event): Promise<any> => {
    const body = await readBody(event)
    return await SqlAttendance.update(body)
})