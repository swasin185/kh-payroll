import { describe, it, expect } from "vitest"
import { $fetch } from "@nuxt/test-utils/e2e"

describe("API endpoints", async () => {
    const testUser = { id: "testuser", name: "Test User" }

    it("GET /api/counter", async () => {
        const res = await $fetch("/api/counter")
        expect(res).greaterThanOrEqual(0)
    })

    it("POST /api/auth/local", async () => {
        const res0 = await $fetch("/api/auth/local", {
            method: "POST",
            body: { id: testUser.id, pwd: "wrongpassword" },
        })
        expect(res0).toBe(false)

        const res = await $fetch("/api/auth/local", {
            method: "POST",
            body: { id: "tom", pwd: "xx" },
        })
        expect(res).toBe(true)
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
