<template>
    <div class="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <h1 class="text-7xl font-extrabold text-red-600 dark:text-red-400">
            {{ error?.statusCode || 500 }}
        </h1>

        <h2 class="mt-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
            {{ error?.statusMessage || "เกิดข้อผิดพลาดในการเชื่อมต่อ" }}
        </h2>

        <p class="mt-2 mb-8 text-lg text-gray-600 dark:text-gray-400">
            ระบบไม่สามารถประมวลผลคำขอได้ โปรดลองอีกครั้ง
        </p>

        <UButton size="xl" @click="handleClearError" label="กลับสู่หน้าหลัก" color="primary"
            icon="i-heroicons-arrow-left-on-rectangle-20-solid" />
    </div>
</template>

<script setup lang="ts">
import type { NuxtError } from "#app"

// The Nuxt error object is passed as a prop automatically
const props = defineProps<{
    error: NuxtError
}>()

/**
 * Clears the error state and redirects the user to the home page ('/').
 */
const handleClearError = () => {
    // clearError is a built-in Nuxt composable
    clearError({ redirect: "/" })
}
</script>
