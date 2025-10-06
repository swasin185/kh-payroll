<template>
    <UError :error="error" :clear="{
        color: 'error',
        size: 'xl',
        icon: 'i-lucide-arrow-left',
        class: 'rounded-full',
    }" />
</template>
<script setup lang="ts">
import type { NuxtError } from "#app"

const props = defineProps({
    error: Object as () => NuxtError,
})
</script>