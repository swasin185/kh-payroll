import SqlUsers from "~~/server/database/SqlUsers"

export default authEventHandler(async (event): Promise<any> => {
    return await SqlUsers.lookup()
})