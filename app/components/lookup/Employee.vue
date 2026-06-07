<template>
    <div class="flex flex-col h-full">
        <UInput
            ref="searchInput"
            v-model="searchText"
            placeholder="ค้นหาพนักงาน..."
            icon="i-lucide-search"
            class="mb-3"
            @keydown.down.prevent="focusTable" />
        <UTable
            ref="table"
            sticky
            @select="onSelect"
            :row-selection="rowSelection"
            :data="employees"
            :columns="columns"
            class="flex-1 min-h-0" />
        <div class="flex items-center justify-between mt-3 pt-3 border-t">
            <span class="text-sm text-gray-500">
                {{ (page - 1) * pageSize + rowIdx + 1 }} / {{ total }} รายการ
            </span>
            <UPagination
                v-model:page="page"
                :items-per-page="pageSize"
                :total="total"
                show-controls
                show-edges />
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { Employee } from "~~/shared/schema"
import type { TableColumn, TableRow } from "@nuxt/ui"
import { getPhotoUrl } from "~~/shared/utils"

const UAvatar = resolveComponent("UAvatar")
const { $waitFetch } = useNuxtApp()
const { user } = useUserSession()
const comCode = user.value.comCode

const lookupKey = defineModel<string>("lookupKey")

const searchText = ref("")
const searchInput = useTemplateRef("searchInput")
const table = useTemplateRef("table")
const employees = ref<Employee[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(15)
const rowSelection: Ref<any> = ref({})
const rowIdx = ref(-1)
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

const columns: TableColumn<Employee>[] = [
    {
        accessorKey: "empCode",
        header: "รหัส",
        cell: ({ row }) => h("div", { class: "font-mono" }, row.getValue("empCode")),
    },
    {
        id: "photo",
        header: "",
        cell: ({ row }) => {
            const emp = row.original
            const fallbackText = emp.name ? emp.name.charAt(0) : "?"
            return h(UAvatar, {
                src: getPhotoUrl(emp.comCode, emp.empCode, true),
                alt: emp.name || "",
                size: "md",
                text: fallbackText,
                lazy: true,
            })
        },
    },
    {
        accessorKey: "name",
        header: "ชื่อ",
    },
    {
        accessorKey: "surName",
        header: "นามสกุล",
    },
    {
        accessorKey: "nickName",
        header: "ชื่อเล่น",
    },
    {
        accessorKey: "department",
        header: "แผนก",
    },
    {
        accessorKey: "empType",
        header: "ประเภท",
    },
]

async function fetchEmployees() {
    const offset = (page.value - 1) * pageSize.value
    const result = await $waitFetch("/api/employee/list", {
        method: "GET",
        query: {
            comCode,
            limit: pageSize.value,
            offset,
            search: searchText.value || undefined,
        },
    })
    employees.value = (result as any).rows
    total.value = (result as any).total

    rowIdx.value = -1
    rowSelection.value = {}
    if (lookupKey.value) {
        const i = employees.value.findIndex((e) => String(e.empCode) === lookupKey.value)
        if (i >= 0) {
            rowIdx.value = i
            rowSelection.value = { [i]: true }
        }
    }
}

// Debounce search
let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(searchText, () => {
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
        fetchEmployees()
    }, 300)
})

watch(page, () => {
    fetchEmployees()
})

function onSelect(e: Event, row: TableRow<Employee>) {
    if (row) {
        rowIdx.value = row.index
        lookupKey.value = String(row.getValue("empCode"))
        rowSelection.value = { [row.index]: true }
    }
}

function focusTable() {
    if (employees.value.length > 0 && rowIdx.value < 0) {
        rowIdx.value = 0
        lookupKey.value = String(employees.value[0]!.empCode)
        rowSelection.value = { 0: true }
    }
}

defineShortcuts({
    arrowup: () => {
        if (rowIdx.value > 0) rowIdx.value--
        lookupKey.value = String(employees.value[rowIdx.value]?.empCode)
        rowSelection.value = { [rowIdx.value]: true }
    },
    arrowdown: () => {
        if (rowIdx.value < employees.value.length - 1) rowIdx.value++
        lookupKey.value = String(employees.value[rowIdx.value]?.empCode)
        rowSelection.value = { [rowIdx.value]: true }
    },
    pageup: () => {
        page.value = Math.max(1, page.value - 1)
        fetchEmployees()
    },
    pagedown: () => {
        page.value = Math.min(totalPages.value, page.value + 1)
        fetchEmployees()
    },
})

onMounted(async () => {
    await fetchEmployees()
    nextTick(() => searchInput.value?.inputRef?.focus())
})
</script>
