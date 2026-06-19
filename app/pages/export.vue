<template>
    <ReportBox :items="reports"> </ReportBox>
</template>

<script lang="ts" setup>
import DateStr from "~~/shared/DateStr"
import A02 from "~/reports/A02"
import A03 from "~/reports/A03"
const reports = [A02, A03]
</script>
