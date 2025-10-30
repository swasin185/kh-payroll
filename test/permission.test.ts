import { describe, it, expect } from "vitest"
import { sqlPermission } from "../server/database/sqlPermission"
import usePayrollMenu from "../app/composables/usePayrollMenu"
import { LEVELS } from "../shared/utils"

describe("Permission", async () => {
    const testCompany = "01"
    const testUser = "tom"
    it("insert() admin permission", async () => {
        await sqlPermission.deleteAll(testCompany, testUser)
        const clear = await sqlPermission.select(testCompany, testUser)
        expect(clear.length).toBe(0)
        const { permissionsFromMenu, permissionsToMenu } = usePayrollMenu()
        const menu = await permissionsToMenu(testUser, testCompany, LEVELS.Developer)
        const result = await sqlPermission.updateAll(
            testCompany,
            testUser,
            permissionsFromMenu(testUser, testCompany, menu),
        )
        expect(result).toBe(true)
        const permission = await sqlPermission.select(testCompany, testUser)
        expect(permission.length).toBeGreaterThan(0)
    })

    it("used count", async () => {
        const prog = "/user"
        const count = 5
        for (let i = 0; i < count; i++) await sqlPermission.used(testCompany, testUser, prog)
        const permission = await sqlPermission.select(testCompany, testUser)
        const found = permission.find((p) => p.program == prog)
        expect(found.used).toBe(count)
    })
})
