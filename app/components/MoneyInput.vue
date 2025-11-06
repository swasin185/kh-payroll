<template>
    <UInputNumber
        v-model="modelValue"
        :step="0.01"
        :format-options="{
            style: 'decimal',
            ...moneyOption
        }"
        locale="en-US"
        placeholder="±#,###,###.##"
        maxLength="20"
        :ui="{ base: 'w-32 text-right' }"
        :increment="false"
        :decrement="false"
    />
</template>

<script setup lang="ts">
import { moneyOption } from '~~/shared/utils';

const modelValue = defineModel<number | null>({ default: null })
</script>
