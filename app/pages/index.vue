<template>
    <UButton class="m-2" label="Waiting" v-on:click="isWaiting = true" :disabled="isWaiting == true" />
    <UButton class="m-2" label="Stop" v-on:click="isWaiting = false" :disabled="!isWaiting" />
</template>

<script lang="ts" setup>
const isWaiting = useState("isWaiting")
</script>
