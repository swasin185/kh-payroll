<template>
    <UCard>
        <UForm :state="state" class="flex gap-4 mb-4">
            <UFormField label="รหัสผู้ใช้งาน (User ID)" name="id">
                <UInput v-model="state.id" />
            </UFormField>
            <UFormField label="ชื่อจริง" name="name">
                <UInput v-model="state.name" />
            </UFormField>
            <UFormField label="อธิบาย" name="descript">
                <UInput v-model="state.descript" />
            </UFormField>
            <UFormField label="รหัสบริษัท" name="comCode">
                <UInput v-model="state.comCode" />
            </UFormField>
        </UForm>
        <UButton type="submit" label="บันทึกข้อมูล" @click="onSaveUser" />
        <template #footer>
            <UButton label="เปลี่ยนรหัสผ่าน" icon="i-heroicons-lock-closed" @click="onSaveUser" />
        </template>
    </UCard>
</template>

<script lang="ts" setup>
import type { SchemaTypes } from "~~/server/database/drizzle"
useHead({ title: "User Profile" })
const { $waitFetch } = useNuxtApp()
const { user } = useUserSession()
const dbuser: Ref<SchemaTypes["users"]> = ref(
    await $waitFetch("/api/users", { method: "GET", query: { id: user.value.id } }),
)
const state = reactive(dbuser)
console.log(Object.keys(dbuser.value))

const toast = useToast()

async function onSaveUser() {
    try {
        await $waitFetch("/api/users", {
            method: "PUT",
            body: state,
        })
        toast.add({
            title: "บันทึกสำเร็จ",
            description: "ข้อมูลผู้ใช้งานถูกอัปเดตแล้ว",
            icon: "i-heroicons-check-circle",
            color: "success",
        })
    } catch (error: any) {
        console.error("Save failed:", error)
        toast.add({
            title: "บันทึกไม่สำเร็จ",
            description: error.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
            icon: "i-heroicons-exclamation-circle",
            color: "error",
        })
    }
}
</script>
