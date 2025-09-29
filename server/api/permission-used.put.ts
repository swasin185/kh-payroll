import { Permission } from "~~/server/database/Permission"
import { authEventHandler } from "~~/server/utils/authEventHandler"

export default authEventHandler(async (event) => {
    const query = getQuery(event)
    const session = await getUserSession(event)
    const userId = (session.user as any).id
    const comCode = (session.user as any).comCode
    const program = query.program?.toString()

    try {
        return await Permission.used(comCode, userId, program!)
    } catch (error) {
        setResponseStatus(event, 500)
        return {
            error: "An internal server error.",
            details: (error as Error).message,
        }
    }
})
