import { defineNitroPlugin, sessionHooks } from "#imports"
import { decreaseActiveUsers } from "~~/server/utils/userCount"

export default defineNitroPlugin(() => {
    sessionHooks.hook("clear", async (session, event) => {
        if (session?.user) {
            console.log(`Session cleared user: ${(session.user as any).id}`)
            await decreaseActiveUsers()
        }
    })
})
