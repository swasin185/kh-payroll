<template>
    <UForm :validate="validate" :state="state" class="space-y-4" @submit="login" @reset="logout">
        <UFormField label="User ID" name="userid" class="w-40">
            <UInput
                v-model="state.userid"
                placeholder="ID ผู้ใช้"
                :disabled="loggedIn"
                maxLength="16"
            />
        </UFormField>
        <UFormField label="Password" name="password" class="w-46">
            <UInput
                v-model="state.password"
                placeholder="รหัสผ่าน"
                :disabled="loggedIn"
                toggleMask
                :type="showPwd ? 'text' : 'password'"
                maxLength="16"
            >
                <UButton
                    variant="link"
                    size="sm"
                    :icon="showPwd ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                    @click="showPwd = !showPwd"
                />
            </UInput>
        </UFormField>
        <UButton v-if="!loggedIn" type="submit" color="primary" label="Login" />
        <UButton v-else type="reset" color="secondary" label="Logout" />
    </UForm>
</template>

<script lang="ts" setup>
const { $waitFetch } = useNuxtApp()
const { loggedIn, user, clear } = useUserSession()
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

import CryptoJS from "crypto-js"
async function login() {
    const loginOk = await $waitFetch("/api/auth/local", {
        method: "POST",
        body: {
            id: state.userid,
            pwd: CryptoJS.MD5(state.password).toString(),
        },
    })
    if (loginOk) location.replace("/")
    else
        useToast().add({
            title: "Login Error",
            description: "ผู้ใช้ id/password ผิดพลาด",
            color: "error",
        })
}

async function logout() {
    await clear()
    location.replace("/login")
}
</script>
