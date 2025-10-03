<template>
    <UCard class="w-[1200px] h-[800px] overflow-auto">
        <slot />
    </UCard>
</template>

<script setup>
useHead({
    title: useState("activeMenu").value.label
})
</script>