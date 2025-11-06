import SqlUsers from "~~/server/database/SqlUsers"

export default authEventHandler(async (event) => {
    const body = await readBody(event)
    return await SqlUsers.update(body)
})