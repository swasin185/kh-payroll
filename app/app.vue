<template>
    <UApp :toaster="{ position: 'top-center' }">
        <header class="flex justify-between items-center p-2 border-b-1">
            <NuxtLink to="/" class="font-bold text-base cursor-pointer">
                KH-PAYROLL v {{ version }}
            </NuxtLink>
            <NuxtLink to="/company" class="font-extrabold text-2xl cursor-pointer">
                {{ user?.comName }}
                [{{ user?.yrPayroll || year }}]
                <UIcon name="i-lucide-calendar-days" class="size-5" />
                [{{ user?.mnPayroll || month }}]
            </NuxtLink>
            <NuxtLink to="/login" class="text-large cursor-pointer" @click="clear()">
                {{ user?.name }}
                <UIcon name="i-lucide-users" class="size-4" />
                [{{ counter }}] {{ user?.id }}
            </NuxtLink>
        </header>
        <div class="flex mt-2">
            <div class="flex flex-col jusify-start items-center font-bold ml-2 mr-4 min-h-screen">
                <UProgress v-if="isWaiting" animation="swing" />
                <UProgress v-else v-model="fullProgress" :max="fullProgress" />
                <UNavigationMenu orientation="vertical" :items="menu" class="w-60" />
            </div>
            <NuxtPage class="w-[1200px] h-[800px] overflow-auto" />
        </div>
    </UApp>
</template>
<script lang="ts" setup>
import { setMenuByUserLevel } from "./menu.config"
import type { NavigationMenuItem } from "@nuxt/ui"

const fullProgress = ref(1)
const isWaiting = useState("isWaiting")
const counter = ref(await $fetch("/api/counter"))

const { user, clear } = useUserSession()
const menu: Ref<NavigationMenuItem[]> = ref(await setMenuByUserLevel(user.value?.level))

const config = useRuntimeConfig()
const date = new Date(config.public.buildTime)
const year = ref(date.getFullYear())
const month = ref(date.getMonth() + 1)
const version = `${year.value - 2025}.${month.value}.${date.getDate()}`
</script>
