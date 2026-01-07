import { describe, it, expect } from "vitest"
import { $fetch } from "@nuxt/test-utils/e2e"
import DateStr from "../../shared/DateStr"

describe("API endpoints", () => {
    it("GET /api/today " + DateStr.TODAY().isoDate, async () => {
        const res = await $fetch("/api/today")
        expect(res).toBe(DateStr.TODAY().isoDate)
    })

    const testUser = {
        id: "testuser",
        name: "Test User",
        descript: "",
        level: 1,
        role: "",
        comCode: "01",
    }

    it("GET /api/counter", async () => {
        const res = await $fetch("/api/counter")
        expect(res).greaterThanOrEqual(0)
    })

    it("POST /api/login", async () => {
        const res0 = await $fetch("/api/login", {
            method: "POST",
            body: { id: testUser.id, pwd: "wrongpassword" },
        })
        expect(res0).toBe(false)
    })

    it("POST /api/users", async () => {
        const res = await $fetch("/api/users", {
            method: "POST",
            body: testUser,
            headers: {
                "x-test-user": "vitest", // bypass authEventHandler()
            },
        })
        expect(res).toBe(true)
    })

    it("GET /api/users", async () => {
        const res = await $fetch("/api/users", {
            query: testUser,
            headers: {
                "x-test-user": "vitest", // bypass authEventHandler()
            },
        })
        expect(res).toHaveProperty("id", testUser.id)
    })

    it("PUT /api/users", async () => {
        const updatedUser = {
            id: testUser.id,
            name: "Updated Name",
            descript: "ทดสอบผู้ใช้ทั่วไป",
            level: "1",
            role: "",
            comCode: "01",
        }
        const res = await $fetch("/api/users", {
            method: "PUT",
            body: updatedUser,
            headers: {
                "x-test-user": "vitest", // bypass authEventHandler()
            },
        })
        expect(res).toBe(true)
    })

    it("GET /api/lookup", async () => {
        const res = await $fetch("/api/lookup", {
            query: { name: "user" },
            headers: {
                "x-test-user": "vitest", // bypass authEventHandler()
            },
        })
        expect(res).toBeInstanceOf(Array)
        expect((res as any).find((u: any) => u.id === "admin")).toBeUndefined()
        const user = (res as any[]).find((u) => u.id === testUser.id)
        expect(user).toHaveProperty("id", testUser.id)
    })

    it("PUT /api/users/password", async () => {
        const res = await $fetch("/api/users/password", {
            method: "PUT",
            body: { id: testUser.id, pwd: "", newPwd: "xxx" },
            headers: {
                "x-test-user": "vitest", // bypass authEventHandler()
            },
        })
        expect(res).toBe(true)
    })

    it("DELETE /api/users", async () => {
        const res = await $fetch("/api/users", {
            method: "DELETE",
            query: { id: testUser.id },
            headers: {
                "x-test-user": "vitest", // bypass authEventHandler()
            },
        })
        expect(res).toBe(true)
    })

})
