import { getDB } from "~~/server/database/pool"

export default defineNitroPlugin((nitroApp) => {
    console.log("Server initialized at startup")

    nitroApp.hooks.hookOnce("close", async () => {
        console.info("[DB] Closing MariaDB pool...")
        await getDB().end()
    })
})
