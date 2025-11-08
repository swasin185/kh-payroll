import SqlEmployee from "~~/server/database/SqlEmployee"

export default authEventHandler(async (event) => {
    const body = await readBody(event)
    return await SqlEmployee.update(body)
})