<template>
    <div class="p-4 max-w-lg mx-auto">
        <h2 class="text-2xl font-semibold mb-6">เปลี่ยนรหัสผ่าน [{{ chgUser }}]</h2>
        <UForm
            ref="form"
            :state="state"
            :schema="ChangePasswordSchema"
            @submit="changePassword"
            class="space-y-4 w-[300px]"
        >
            <UFormField label="รหัสผ่านปัจจุบัน" name="currentPassword" required>
                <UInput
                    v-model="state.currentPassword"
                    type="password"
                    icon="i-lucide-lock-keyhole"
                    placeholder="ป้อนรหัสผ่านปัจจุบัน"
                />
            </UFormField>

            <UFormField label="รหัสผ่านใหม่" name="newPassword" required>
                <UInput
                    v-model="state.newPassword"
                    type="password"
                    icon="i-lucide-lock"
                    placeholder="ป้อนรหัสผ่านใหม่"
                />
            </UFormField>

            <UFormField label="ยืนยันรหัสผ่านใหม่" name="confirmPassword" required>
                <UInput
                    v-model="state.confirmPassword"
                    type="password"
                    icon="i-lucide-lock"
                    placeholder="ยืนยันรหัสผ่านใหม่"
                />
            </UFormField>

            <UButton
                type="submit"
                label="เปลี่ยนรหัสผ่าน"
                icon="i-lucide-rotate-ccw"
                :loading="loading"
            />
        </UForm>
    </div>
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
})
import { z } from "zod"

const pwdMessage = "รหัสผ่านปัจจุบันต้องมีความยาวอย่างน้อย 6 ตัวอักษร"
const ChangePasswordSchema = z
    .object({
        currentPassword: z.string().min(6, pwdMessage),
        newPassword: z.string().min(6, pwdMessage),
        confirmPassword: z.string().min(6, pwdMessage),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "รหัสผ่านใหม่และการยืนยันไม่ตรงกัน",
        path: ["confirmPassword"], // Show error on confirmPassword field
    })

type ChangePasswordData = z.infer<typeof ChangePasswordSchema>

const form = useTemplateRef("form")
const toast = useToast()

const loading = ref(false)

// Initial state for the form
const state = reactive<ChangePasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
})

import CryptoJS from "crypto-js"
import { LEVELS } from "~~/shared/utils"

async function changePassword(): Promise<void> {
    const result = await (form.value as any).validate()

    loading.value = true
    try {
        await $waitFetch("/api/password", {
            method: "PUT",
            body: {
                id: chgUser.value,
                pwd: CryptoJS.MD5(state.currentPassword).toString(),
                newPwd: CryptoJS.MD5(state.newPassword).toString(),
            },
        })

        toast.add({
            title: "สำเร็จ!",
            description: "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว",
            icon: "i-lucide-check-circle",
        })

        Object.assign(state, {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        })
        form.value?.clear()

    } catch (error) {
        // Error Feedback (e.g., current password incorrect, or server error)
        console.error("Change password failed:", error)
        toast.add({
            title: "ผิดพลาด",
            description: "ไม่สามารถเปลี่ยนรหัสผ่านได้. โปรดตรวจสอบรหัสผ่านปัจจุบัน.",
            icon: "i-lucide-x-circle",
        })
    } finally {
        loading.value = false
    }
}
</script>
