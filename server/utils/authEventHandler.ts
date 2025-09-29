import { H3Event } from "h3"

export function authEventHandler(handler: (event: H3Event) => Promise<any> | any) {
    return defineEventHandler(async (event) => {
        const session = await getUserSession(event)
        if (!session || !session.user) {
            const testUserJson = getHeader(event, "x-test-user")
            // bypass user authenticated when vitest
            if (testUserJson === "vitest") return handler(event)
            throw createError({
                statusCode: 401,
                statusMessage: "Unauthorized",
                message: "Access denied. You must be logged in to access this resource.",
            })
        }
        return handler(event)
    })
}
