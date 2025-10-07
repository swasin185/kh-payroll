import { removeSession } from "~~/server/utils/session"

export default defineNitroPlugin(() => {
    sessionHooks.hook("clear", async (session, event) => {
        if (session?.user) {
            const sessionId = (await getUserSession(event))?.id
            if (sessionId) await removeSession(sessionId)
            console.log(`Session cleared : ${(session.user as any).id}@${sessionId}`)
        }
    })
})
