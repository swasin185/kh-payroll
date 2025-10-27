import { describe, it, expect } from "vitest"
import { useDrizzle, closeDrizzle } from "../server/database/drizzle"
import { Users } from "../server/database/Users"
import { LookupItem } from "../shared/types"

describe("Payroll MariaDB", async () => {
    const db = useDrizzle()
    console.log("Database connected")

    const TEST_USER_ID = "testuser"
    const testUser = { id: TEST_USER_ID, name: "Integration Test" } as any

    it("Database is payroll", async () => {
        const [rows] = await db.execute("SELECT DATABASE() AS db")
        expect((rows as any)[0].db).toBe("payroll")
    })

    it("insert() returns true for new user", async () => {
        const result = await Users.insert(testUser)
        expect(result).toBe(true)
    })

    it("select() returns the user by ID", async () => {
        const user = await Users.select(TEST_USER_ID)
        expect(user).not.toBeNull()
        expect(user?.id).toBe(TEST_USER_ID)
    })

    it("lookup() returns users excluding admin", async () => {
        for (let i=0; i < 10; i++) {
            // await db.execute("select sleep(5)") // for debugging
            const users: LookupItem[] = await Users.lookup()
            expect(Array.isArray(users)).toBe(true)
            expect(users.find((u) => u.id === "admin")).toBeUndefined()
        }
    })

    it("update() returns true for existing user", async () => {
        const updateName = "Updated Name"
        const result = await Users.update({ ...testUser, name: updateName })
        expect(result).toBe(true)
        const user = await Users.select(TEST_USER_ID)
        expect(user?.name).toBe(updateName)
    })

    it("delete() returns true for deleted user", async () => {
        const result = await Users.delete(TEST_USER_ID)
        expect(result).toBe(true)
        const user = await Users.select(TEST_USER_ID)
        expect(user).toBeNull()
    })
})
