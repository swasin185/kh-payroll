<template>
    <UApp :toaster="{ position: 'top-center' }">
        <UHeader>
            <template #title>
                <NuxtLink to="/company">
                    [{{ user?.yrPayroll || year }}]
                    <UIcon name="i-lucide-calendar-days" class="size-5" />
                    [{{ user?.mnPayroll || month }}] {{ user?.comName }}
                </NuxtLink>
            </template>
            <h1 class="text-l font-bold">{{ title }}</h1>
            <template #right>
                <NuxtLink to="/login" class="text-large">
                    {{ user?.name }}
                    <UIcon name="i-lucide-users" class="size-4" />
                    [{{ counter }}]
                    {{ user?.id }}
                </NuxtLink>
            </template>
            <template #body>
                <UNavigationMenu orientation="vertical" :items="menu" />
            </template>
        </UHeader>
        <UProgress v-if="isWaiting" animation="elastic" size="2xs" />
        <UProgress v-else v-model="fullProgress" :max="fullProgress" size="2xs" />
        <UMain class="flex">
            <!-- show only if screen is desktop size -->
            <div class="flex flex-col items-center hidden lg:flex">
                KH-PAYROLL v {{ version }}
                <UNavigationMenu orientation="vertical" :items="menu" class="w-60" />
                <USeparator class="w-60" />
                <UColorModeButton />
            </div>
            <NuxtLayout>
                <NuxtPage />
            </NuxtLayout>
        </UMain>
    </UApp>
</template>
<script lang="ts" setup>
import { setMenuByUserLevel } from "./menu.config"
const title = useState("title")
const fullProgress = ref(1)
const isWaiting = useState("isWaiting")
const counter = ref(await $fetch("/api/counter"))

const { user } = useUserSession()
const menu = await setMenuByUserLevel(user.value?.level)

const config = useRuntimeConfig()
const date = new Date(config.public.buildTime)
const year = ref(date.getFullYear())
const month = ref(date.getMonth() + 1)
const version = `${year.value - 2025}.${month.value}.${date.getDate()}`
</script>
