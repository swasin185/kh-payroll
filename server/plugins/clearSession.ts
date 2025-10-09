import { removeSession } from "~~/server/utils/sessions"

export default defineNitroPlugin(() => {
    sessionHooks.hook("clear", async (session, event) => {
        if (session?.user) {
            await removeSession((await getUserSession(event)).id!)
            console.log("Clear : ", session?.user)
        }
    })
})
