import { getDB } from "~~/server/database/pool"
import SqlUsers from "../database/SqlUsers"
import SqlCompany from "../database/SqlCompany"
export default defineNitroPlugin(async (nitroApp) => {
    console.log("Server initialized at startup")
    try {
        const users = await SqlUsers.lookup()
        console.log(users)
    } catch (error) {
        console.log(error)
    }
    nitroApp.hooks.hookOnce("close", async () => {
        console.info("[DB] Closing MariaDB pool...")
        await getDB().end()
    })
})
