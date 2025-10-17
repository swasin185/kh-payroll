<template>
    <UHeader mode="drawer">
        <template #title>
            <UButton @click="onSelectCom">
                [{{ user?.yrPayroll || year }}]
                <UIcon name="i-lucide-calendar-days" class="size-5" />
                [{{ user?.mnPayroll || month }}]
                {{ user?.comName }}
            </UButton>
        </template>
        <h1 class="text-l font-bold">{{ activeMenu.label }}</h1>
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
        <ModalDialog />
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

const confirm = useDialog()
const { $waitFetch } = useNuxtApp()
const onSelectCom = () =>
    confirm({
        lookupName: "Company",
        lookupCode: user.value.comCode,
    }).then(async (code) => {
        if (!code) return
        await $waitFetch("/api/company-session", {
            method: "PUT",
            query: { comCode: code },
        })
        location.reload()
    })

useHead({
    title: activeMenu.value?.label,
})
</script>
