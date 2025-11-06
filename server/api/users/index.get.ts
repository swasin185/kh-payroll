import SqlUsers from "~~/server/database/SqlUsers"

export default authEventHandler(async (event) => {
    const query = getQuery(event)
    return await SqlUsers.select(query.id!.toString())
})