<template>
    <UCard>
        <UForm :state="dbuser" class="flex flex-col gap-4" @submit="onSaveUser" @reset="reset">
            <UFormField label="User ID" name="userid">
                <UInput v-model="dbuser.id" placeholder="ID ผู้ใช้" class="w-30" disabled />
            </UFormField>
            <UFormField label="ชื่อจริง" name="name">
                <UInput v-model="dbuser.name" class="w-75" />
            </UFormField>
            <UFormField label="อธิบาย" name="descript">
                <UInput v-model="dbuser.descript" class="w-100" />
            </UFormField>
            <UFormField label="LEVEL" name="level">
                <UInput v-model="dbuser.level" class="w-20" :disabled="user.level < 9" />
            </UFormField>
            <UFormField label="ROLE" name="role">
                <UInput v-model="dbuser.role" class="w-30" :disabled="user.level < 9" />
            </UFormField>
            <div class="flex gap-4 w-full">
                <UButton type="submit" color="info" label="Save" />
                <UButton type="reset" color="warning" label="Reset" />
            </div>
        </UForm>
    </UCard>
</template>

<script lang="ts" setup>
useHead({
    title: "User Profile"
})
import type { SchemaTypes } from "~~/server/database/drizzle"
const { $waitFetch } = useNuxtApp()
const { user } = useUserSession()
const dbuser: Ref<SchemaTypes["users"]> = ref(
    await $waitFetch("/api/users", { method: "GET", query: { id: user.value.id } }),
)

const toast = useToast()

async function onSaveUser() {
    await $waitFetch("/api/users", {
        method: "PUT",
        query: {
            id: dbuser.value.id,
            name: dbuser.value.name,
            descript: dbuser.value.descript,
            level: dbuser.value.level,
            role: dbuser.value.role
        },
    })
    toast.add({ title: `[${new Date()}] Save`, description: "บันทึกเรียบร้อย", color: "success" })
}

async function reset() {
    location.reload()
}
</script>
