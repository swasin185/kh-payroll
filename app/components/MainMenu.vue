<template>
    <UCard class="flex flex-col text-center w-full">
        <div class="mb-4">
            KH-PAYROLL v {{ version }}
        </div>
        <UNavigationMenu orientation="vertical" :items="menu" />
        <USeparator class="mb-4" />
        <UColorModeSelect />
    </UCard>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

defineProps<{
    version: string,
    menu: NavigationMenuItem[]
}>()

</script>
