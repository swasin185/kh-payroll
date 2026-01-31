<template>
    <h2 class="text-xl mb-6">เปลี่ยนรหัสผ่าน [{{ chgUser }}]</h2>
    <UForm
        ref="form"
        :state="state"
        :schema="ChangePasswordSchema"
        @submit="changePassword"
        class="space-y-4 w-[300px]"
    >
        <UFormField label="รหัสผ่านปัจจุบัน" name="currentPassword">
            <UInput
                v-model="state.currentPassword"
                type="password"
                icon="i-lucide-lock-keyhole"
                placeholder="ป้อนรหัสผ่านปัจจุบัน"
            />
        </UFormField>

        <UFormField label="รหัสผ่านใหม่" name="newPassword">
            <UInput
                v-model="state.newPassword"
                type="password"
                icon="i-lucide-lock"
                placeholder="ป้อนรหัสผ่านใหม่"
            />
        </UFormField>

        <UFormField label="ยืนยันรหัสผ่านใหม่" name="confirmPassword">
            <UInput
                v-model="state.confirmPassword"
                type="password"
                icon="i-lucide-lock"
                placeholder="ยืนยันรหัสผ่านใหม่"
            />
        </UFormField>

        <UButton type="submit" label="เปลี่ยนรหัสผ่าน" icon="i-lucide-rotate-ccw" />
    </UForm>
</template>

<script lang="ts" setup>
definePageMeta({ keepalive: true })

const { $waitFetch } = useNuxtApp()
const { user } = useUserSession()

const chgUser: Ref<string> = ref(user.value.id)

onActivated(() => {
    const route = useRoute()
    if (user.value.level >= LEVELS.Admin) chgUser.value = route.query.userId || user.value.id
    else chgUser.value = user.value.id
    Object.assign(state, {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })
})

import { z } from "zod"

const mesg = "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร"
const ChangePasswordSchema = z
    .object({
        currentPassword: z.string(),
        newPassword: z.string().min(6, mesg),
        confirmPassword: z.string().min(6, mesg),
    })
    .refine((data: { currentPassword: string; newPassword: string; confirmPassword: string }) => data.newPassword === data.confirmPassword, {
        message: "รหัสผ่านใหม่และการยืนยันไม่ตรงกัน",
        path: ["confirmPassword"],
    })

type ChangePasswordData = z.infer<typeof ChangePasswordSchema>

const form = useTemplateRef("form")
const toast = useToast()

const state = reactive<ChangePasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
})

import CryptoJS from "crypto-js"
import { LEVELS } from "~~/shared/utils"

async function changePassword(): Promise<void> {
    await (form.value as any).validate()
    const result = await $waitFetch("/api/users/password", {
        method: "PUT",
        body: {
            id: chgUser.value,
            pwd: CryptoJS.MD5(state.currentPassword).toString(),
            newPwd: CryptoJS.MD5(state.newPassword).toString(),
        },
    })

    if (result) {
        toast.add({
            title: "สำเร็จ!",
            description: "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว",
            icon: "i-lucide-check-circle",
        })
        form.value?.clear()
    } else
        toast.add({
            title: "ผิดพลาด",
            description: "ไม่สามารถเปลี่ยนรหัสผ่านได้. โปรดตรวจสอบรหัสผ่านปัจจุบัน.",
            icon: "i-lucide-x-circle",
            color: "error",
        })
}
</script>
