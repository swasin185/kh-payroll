import { H3Event} from "h3"
import { addOrRenewSession } from "./session"

export function authEventHandler(handler: (event: H3Event) => Promise<H3Event> | any) {
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
        await addOrRenewSession(session?.id)
        return handler(event)
    })
}
