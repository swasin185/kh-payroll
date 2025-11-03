import { getDB } from "~~/server/database/pool"
import SqlUsers from "../database/SqlUsers"

export default defineNitroPlugin(async (nitroApp) => {
    console.log("Server initialized at startup")
    try {
        const users = await SqlUsers.select("admin")
        console.log("[DB] is connected -", users.id, users.name, users.created)
    } catch (error) {
        console.log(error)
    }
    
    nitroApp.hooks.hookOnce("close", async () => {
        console.info("[DB] Closing MariaDB pool...")
        await getDB().end()
    })
})
