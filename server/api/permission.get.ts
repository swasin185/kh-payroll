import { Permission } from "~~/server/database/Permission"

export default eventHandler(async (event) => {
    const session = await getUserSession(event)
    const userId = (session.user as any).id
    const comCode = (session.user as any).comCode
    if (!comCode || !userId) {
        throw createError({
            statusCode: 400,
            statusMessage: "Com & User ID is required.",
        })
    }
    try {
        return await Permission.select(comCode, userId)
    } catch (error) {
        console.error("Database query error :", error)
        setResponseStatus(event, 500)
        return {
            error: "An internal server error.",
            details: (error as Error).message,
        }
    }
})
