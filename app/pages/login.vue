<template>
    <UCard>
        <div class="w-80 flex justify-between items-center mb-1">
            <span>User</span>
            <span>
                <UInput ref="txtUser" class="w-50" v-model="username" placeholder="ชื่อ user" :disabled="loggedIn" />
            </span>
        </div>
        <div class="w-80 flex justify-between items-center mb-2">
            <span>Password</span>
            <span>
                <UInput class="w-50" ref="txtPassword" v-model="password" placeholder="รหัสผ่าน" :disabled="loggedIn"
                    toggleMask @keydown.enter="login" :type="show ? 'text' : 'password'" :ui="{ trailing: 'pe-1' }">
                    <template #trailing>
                        <UButton color="neutral" variant="link" size="sm"
                            :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                            @click="show = !show" />
                    </template>
                </UInput>
            </span>
        </div>
        <UButton class="w-20 justify-center" color="secondary" v-if="loggedIn" @click="logout">Logout</UButton>
        <UButton class="w-20 justify-center" color="primary" v-else @click="login" :disabled="isWaiting">Login</UButton>
    </UCard>
</template>

<script lang="ts" setup>
useHead({
    title: "Login",
})
import CryptoJS from "crypto-js"
const { $waitFetch } = useNuxtApp()
const { loggedIn, user, clear, fetch: refreshSession } = useUserSession()
const show = ref(false)
const username: Ref<string> = ref(user.value?.id || "")
const password: Ref<string> = ref("")
const txtUser = useTemplateRef("txtUser")
const txtPassword = useTemplateRef("txtPassword")
const isWaiting = useState("isWaiting") as Ref<boolean>

async function login() {
    if (!username.value) {
        txtUser.value!.inputRef?.focus()
        return
    }
    if (!password.value) {
        txtPassword.value!.inputRef?.focus()
        return
    }
    await $waitFetch("/api/auth/local", {
        method: "POST",
        body: {
            id: username.value,
            pwd: CryptoJS.MD5(password.value).toString(),
        },
    })
    await refreshSession()
    if (loggedIn.value) {
        await navigateTo("/")
        location.reload()
    } else   
        alert("ชื่อผู้ใช้/รหัสผ่าน ผิดพลาด")
}

async function logout() {
    await clear()
    location.reload()
}
</script>
