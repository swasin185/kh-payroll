import SqlUsers from "~~/server/database/SqlUsers"
import { type Users } from "~~/shared/schema"

export default authEventHandler(async (event): Promise<any> => {
    const body = await readBody(event)
    return await SqlUsers.update(body as Users)
})