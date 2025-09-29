<template>
    <UCard>
        <div class="text-3xl">Index Page</div>
        <UButton class="m-2" label="waiting" v-on:click="isWaiting=true"/>
        <UButton class="m-2" label="stop" v-on:click="isWaiting=false"/>
    </UCard>
</template>

<script lang="ts" setup>
useHead({
    title: "Index Page",
})
const isWaiting = useState("isWaiting")
</script>
