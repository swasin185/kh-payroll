import { describe, it, expect } from "vitest"
import { useDrizzle } from "../server/database/drizzle"
import { Permission } from "../server/database/Permission"
import usePayrollMenu from "../app/composables/usePayrollMenu"
import { LEVELS } from "../shared/utils"

describe("Permission", async () => {
    useDrizzle()
    console.log("Database connected")

    const testCompany = "00"
    const testUser = "tom"
    it("insert() admin permission", async () => {
        await Permission.deleteAll(testCompany, testUser)
        const clear = await Permission.select(testCompany, testUser)
        expect(clear.length).toBe(0)
        const { permissionsFromMenu, permissionsToMenu } = usePayrollMenu()
        const menu = await permissionsToMenu(testUser, testCompany, LEVELS.Developer)
        const result = await Permission.updateAll(
            testCompany,
            testUser,
            permissionsFromMenu(testUser, testCompany, menu),
        )
        expect(result).toBe(true)
        const permission = await Permission.select(testCompany, testUser)
        expect(permission.length).toBeGreaterThan(0)
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
