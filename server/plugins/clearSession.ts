import { decreaseSessionCount } from "~~/server/utils/sessionCount"

export default defineNitroPlugin(() => {
    sessionHooks.hook("clear", async (session, event) => {
        if (session?.user) {
            decreaseSessionCount(event)
            console.log(`Session cleared : ${(session.user as any).id}`)
        }
    })
})
