import { describe, it, expect } from "vitest"
import { getDB } from "../server/database/pool"
import SqlUsers from "../server/database/SqlUsers"
import { LookupItem } from "../shared/types"
import { Users } from "../shared/schema"
import SqlAttendance from "../server/database/SqlAttendance"

describe("Payroll MariaDB", async () => {
    const db = getDB()
    console.log("Database connected")

    const TEST_USER_ID = "testuser"
    const testUser = { id: TEST_USER_ID, name: "Integration Test", descript: "", level: 1, role: "", comCode: "01" } as Users

    it("Database is payroll", async () => {
        const [rows] = await db.execute("SELECT DATABASE() AS db")
        expect((rows as any)[0].db).toBe("payroll")
    })

    it("insert() returns true for new user", async () => {
        const result = await SqlUsers.insert(testUser)
        expect(result).toBe(true)
    })

    it("select() returns the user by ID", async () => {
        const user = await SqlUsers.select(TEST_USER_ID)
        expect(user).not.toBeNull()
        expect(user?.id).toBe(TEST_USER_ID)
    })

    it("lookup() returns users excluding admin", async () => {
        for (let i = 0; i < 10; i++) {
            // await db.execute("select sleep(5)") // for debugging
            const users: LookupItem[] = await SqlUsers.lookup()
            expect(Array.isArray(users)).toBe(true)
            expect(users.find((u) => u.id === "admin")).toBeUndefined()
            expect(users.length).toBeGreaterThan(1)
        }
    })

    it("update() returns true for existing user", async () => {
        const updateName = "Updated Name"
        const result = await SqlUsers.update({ ...testUser, name: updateName })
        expect(result).toBe(true)
        const user = await SqlUsers.select(TEST_USER_ID)
        expect(user?.name).toBe(updateName)
        expect(user?.comCode).toBe(testUser.comCode)
    })

    it("delete() returns true for deleted user", async () => {
        const result = await SqlUsers.delete(TEST_USER_ID)
        expect(result).toBe(true)
        const user = await SqlUsers.select(TEST_USER_ID)
        expect(user).toBeNull()
    })

    it("runTimeCard() && runAttendance()", async () => {
        const dateTxt = "2024-12-04"
        const x = await db.execute("call payroll.runTimeCard(?)", [dateTxt])
        expect(x).not.toBeNull()
        const result = await db.query("select * from payroll.attendance where dateTxt = ?", [dateTxt])
        expect(result.length).toBeGreaterThan(0)
        const y = await db.execute("call payroll.runAttendance(?)", [dateTxt])
        expect(y).not.toBeNull()
        await db.execute("delete from payroll.attendance where dateTxt = ?", [dateTxt])
    })
})
