import { describe, it, expect, afterAll } from "vitest"
import { useDrizzle, closeDrizzle } from "../server/database/drizzle"
import { Permission } from "../server/database/Permission"
import { setMenuByUserLevel } from "../app/menu.config"

afterAll(async () => {
    closeDrizzle()
    console.log("Database connection closed")
})

describe("Permission", async () => {
    useDrizzle()
    console.log("Database connected")

    it("insert() admin permission", async () => {
        await Permission.deleteAll("00", "admin")
        const allMenuItems = await Permission.select("00", "admin")
        const menu = await setMenuByUserLevel(9, [])
        let group = menu[0]
        for (let item of group)
            if (item.children)
                for (let child of item.children!)
                    if (!allMenuItems.some((p) => p.program === child.to)) {
                        const result = await Permission.insert({
                            comCode: "00",
                            userid: "admin",
                            program: child.to,
                            level: 9,
                            used: 0,
                        })
                        expect(result).toBe(true)
                    }
    })
})
