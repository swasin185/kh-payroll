import SqlUsers from "~~/server/database/SqlUsers"
import { type Users } from "~~/shared/schema"

export default authEventHandler(async (event) => {
    const body = await readBody(event)
    return await SqlUsers.insert(body as Users)
})