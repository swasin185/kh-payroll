<template>
    <UApp title="PAYROLL">
        <header class="flex justify-between items-center p-2 border-b-1">
            <NuxtLink to="/" class="font-bold text-base cursor-pointer">
                KEEHIN PAYROLL v {{ buildTime }}
            </NuxtLink>
            <NuxtLink to="/company" class="font-extrabold text-2xl cursor-pointer">
                {{ user?.comName }}
                [{{ user?.yrPayroll }}]
                <UIcon name="i-lucide-calendar-range" class="size-5" />
                [{{ user?.mnPayroll }}]
            </NuxtLink>
            <NuxtLink to="/login" class="text-large cursor-pointer" v-on:click="clear()">
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
const { user, clear } = useUserSession()
const isWaiting = useState("isWaiting")
const fullProgress = ref(1)
const counter = ref(await $fetch("/api/counter"))
const menu: Ref<any[]> = ref(await setMenuByUserLevel(user.value?.level))

const config = useRuntimeConfig()
const buildTime = computed(() => {
    const date = new Date(config.public.buildTime)
    const yearBase = 2025
    const a = date.getFullYear() - yearBase
    const b = date.getMonth() + 1
    const c = date.getDate()
    return `${a}.${b}.${c}`
})
</script>
