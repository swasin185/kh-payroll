<template>
    <UForm :validate="validate" :state="state" class="p-4 space-y-4" @submit="login" @reset="logout">
        <UFormField label="User ID" name="userid">
            <UInput v-model="state.userid" placeholder="ID ผู้ใช้" :disabled="loggedIn" />
        </UFormField>
        <UFormField label="Password" name="password">
            <UInput v-model="state.password" placeholder="รหัสผ่าน" :disabled="loggedIn" toggleMask
                :type="showPwd ? 'text' : 'password'">
                <UButton variant="link" size="sm" :icon="showPwd ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                    @click="showPwd = !showPwd" />
            </UInput>
        </UFormField>
        <UButton v-if="!loggedIn" type="submit" color="primary" label="Login" />
        <UButton v-else type="reset" color="secondary" label="Logout" />
    </UForm>
</template>

<script lang="ts" setup>
const { $waitFetch } = useNuxtApp()
const { loggedIn, user, clear, fetch: refreshSession } = useUserSession()
const showPwd = ref(false)
const state = reactive({
    userid: user.value?.id,
    password: "",
})

import type { FormError } from "@nuxt/ui"
const validate = (state: any): FormError[] => {
    const errors = []
    if (!state.userid) errors.push({ name: "userid", message: "Required" })
    if (!state.password) errors.push({ name: "password", message: "Required" })
    return errors
}

const toast = useToast()

import CryptoJS from "crypto-js"
async function login() {
    await $waitFetch("/api/auth/local", {
        method: "POST",
        body: {
            id: state.userid,
            pwd: CryptoJS.MD5(state.password).toString(),
        },
    })
    await refreshSession()
    if (loggedIn.value) {
        await navigateTo("/")
        location.reload()
    } else
        toast.add({
            title: `[${new Date()}] Login Error`,
            description: "ผู้ใช้ id/password ผิดพลาด",
            color: "error",
        })
}

async function logout() {
    await clear()
    location.reload()
}
</script>
