<template>
    <div class="flex items-start justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div
            class="max-w-xs border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-8 bg-white dark:bg-gray-800 mt-32">
            <UForm
                :validate="validate"
                :state="state"
                class="space-y-4"
                @submit="login"
                @reset="logout">
                <UFormField label="User ID" name="userid">
                    <UInput
                        ref="useridInput"
                        v-model="state.userid"
                        placeholder="ID ผู้ใช้"
                        :disabled="loggedIn"
                        maxLength="16">
                        <UButton variant="link" size="sm" icon="i-lucide-log-in" />
                    </UInput>
                </UFormField>
                <UFormField label="Password" name="password">
                    <UInput
                        v-model="state.password"
                        placeholder="รหัสผ่าน"
                        :disabled="loggedIn"
                        toggleMask
                        :type="showPwd ? 'text' : 'password'"
                        maxLength="16">
                        <UButton
                            variant="link"
                            size="sm"
                            :icon="showPwd ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                            @click="showPwd = !showPwd" />
                    </UInput>
                </UFormField>
                <div class="flex gap-2 pt-2">
                    <UButton
                        v-if="!loggedIn"
                        type="submit"
                        color="primary"
                        label="Login"
                        class="flex-1" />
                    <UButton v-else type="reset" color="secondary" label="Logout" class="flex-1" />
                </div>
            </UForm>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, onActivated, nextTick } from 'vue'
const { $waitFetch } = useNuxtApp()
const { loggedIn, user, clear } = useUserSession()
const showPwd = ref(false)
const state = reactive({
    userid: user.value?.id,
    password: "",
})

// Template ref for the userid input (component or element)
const useridInput = ref<any>(null)

async function focusUserid() {
    await nextTick()
    try {
        const compOrEl = useridInput.value
        if (!compOrEl) return
        // If it's a component with $el, query inside; otherwise assume it's element
        const root = compOrEl.$el ?? compOrEl
        const inputEl: HTMLInputElement | null = root?.querySelector ? root.querySelector('input') : null
        if (inputEl && typeof inputEl.focus === 'function') {
            inputEl.focus()
            inputEl.select && inputEl.select()
        } else if (root && typeof root.focus === 'function') {
            root.focus()
        }
    } catch (e) {
        // ignore
    }
}

onMounted(() => {
    focusUserid()
})
onActivated && onActivated(() => {
    focusUserid()
})

import type { FormError } from "#ui/types"
const validate = (state: any): FormError[] => {
    const errors = []
    if (!state.userid) errors.push({ name: "userid", message: "Required" })
    if (!state.password) errors.push({ name: "password", message: "Required" })
    return errors
}

import CryptoJS from "crypto-js"

async function login() {
    const loginOk = await $waitFetch("/api/login", {
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
