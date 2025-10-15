<template>
    <UHeader mode="drawer">
        <template #title>
            <NuxtLink to="/company">
                [{{ user?.yrPayroll || year }}]
                <UIcon name="i-lucide-calendar-days" class="size-5" />
                [{{ user?.mnPayroll || month }}] {{ user?.comName }}
            </NuxtLink>
        </template>
        <h1 class="text-l font-bold">{{ activeMenu.label }}ww</h1>
        <template #right>
            <NuxtLink to="/login" class="text-large">
                {{ user?.name }}
                <UIcon name="i-lucide-users" class="size-4" />
                [{{ counter }}]
                {{ user?.id }}
            </NuxtLink>
        </template>
        <template #body>
            <MainMenu :version="version" :menu="menuState" />
        </template>
    </UHeader>
    <UProgress v-if="isWaiting" animation="elastic" size="2xs" />
    <UProgress v-else v-model="fullProgress" :max="fullProgress" size="2xs" />
    <UMain class="flex justify-center">
        <!-- show only if screen is desktop size -->
        <MainMenu :version="version" :menu="menuState" class="hidden lg:flex w-[300px] h-[800px]" />
        <UCard class="w-[1200px] h-[800px] overflow-auto">
            <slot />
        </UCard>
    </UMain>
</template>

<script setup lang="ts">
const fullProgress = ref(1)
const isWaiting = useWaiting()
const { counter, setScheduleCount } = useCounter()
setScheduleCount()

const { user } = useUserSession()
const { menuState, activeMenu, setMenuSession } = usePayrollMenu()
await setMenuSession()
const config = useRuntimeConfig()
const date = new Date(config.public.buildTime)
const year = ref(date.getFullYear())
const month = ref(date.getMonth() + 1)
const version = `${year.value - 2025}.${month.value}.${date.getDate()}`

useHead({
    title: activeMenu.value?.label
})
</script>