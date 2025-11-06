import SqlUsers from "~~/server/database/SqlUsers"

export default authEventHandler(async (event) => {
    return await SqlUsers.lookup()
})