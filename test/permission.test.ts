import { describe, it, expect, afterAll } from "vitest"
import { useDrizzle, closeDrizzle } from "../server/database/drizzle"
import { Permission } from "../server/database/Permission"
import usePayrollMenu from "../app/composables/usePayrollMenu"

afterAll(async () => {
    closeDrizzle()
    console.log("Database connection closed")
})

describe("Permission", async () => {
    useDrizzle()
    console.log("Database connected")

    const testCompany = "00"
    const testUser = "admin"
    it("insert() admin permission", async () => {
        await Permission.deleteAll(testCompany, testUser)
        const permission = await Permission.select(testCompany, testUser)
        const { menuState: menu } = usePayrollMenu()
        for (let item of menu.value)
            if (item.children)
                for (let child of item.children!)
                    if (!permission.some((p) => p.program === child.to)) {
                        const result = await Permission.insert({
                            comCode: testCompany,
                            userid: testUser,
                            program: child.to,
                            level: 9,
                            used: 0,
                        })
                        expect(result).toBe(true)
                    }
    })

    it("used count", async () => {
        const prog = "/user"
        const count = 5
        for (let i = 0; i < count; i++) await Permission.used(testCompany, testUser, prog)
        const permission = await Permission.select(testCompany, testUser)
        const found = permission.find((p) => p.program == prog)
        expect(found.used).toBe(count)
    })
})
