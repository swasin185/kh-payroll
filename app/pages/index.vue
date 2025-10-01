<template>
    <UCard>
        <div class="text-3xl">Index Page</div>
        <UButton class="m-2" label="Waiting" v-on:click="isWaiting = true" :disabled="isWaiting as boolean" />
        <UButton class="m-2" label="Stop" v-on:click="isWaiting = false" :disabled="!isWaiting" />
    </UCard>
</template>

<script lang="ts" setup>
useHead({
    title: "Index Page",
})
const isWaiting = useState("isWaiting")
</script>
