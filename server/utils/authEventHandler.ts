import { H3Event} from "h3"
import { renewSession } from "./sessions"

export function authEventHandler(handler: (event: H3Event) => Promise<H3Event> | any) {
    return defineEventHandler(async (event) => {
        const session = await validateSession(event)
        if (session?.user) 
            await renewSession(session.id, session.user?.id)
        else {
            const testUserJson = getHeader(event, "x-test-user")
            // bypass user authenticated for vitest
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
