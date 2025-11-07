<template>
    <ToolbarData
        lookupName="user"
        v-model:searchKey="search"
        v-model:mode="mode"
        :level="activeMenu.level"
        :newRecord="newRecord"
        :onSelect="onSelect"
        :onInsert="onInsert"
        :onUpdate="onUpdate"
        :onDelete="onDelete"
        :onPrint="onPrint"
    />
    <DBLookup
        v-model:lookupKey="comCode"
        name="company"
        class="w-80 mb-4"
        :disabled="mode == DBMODE.Insert || mode == DBMODE.Update || mode == DBMODE.Delete"
        @update:model-value="onSelect"
    />
    <UBadge class="justify-center w-8 m-4" :label="count" />
    <UTree class="w-100" :items="permissions" v-model="menuItem" selection-behavior="replace">
        <template #item-trailing="{ item }">
            <UBadge
                v-if="!item.children && mode == DBMODE.Select && item.badge as number > 0"
                class="justify-center w-8 m-0 p-1 bg-yellow-500"
                :label="item.badge as string"
            />
            <USelect
                v-if="!item.children"
                class="w-32 m-0 p-1"
                :model-value="item.level"
                :items="LEVEL_ITEMS"
                @update:model-value="updateLevel"
                :disabled="mode != DBMODE.Update || item.to != menuItem.to"
            />
        </template>
    </UTree>
    <DBLookup
        v-if="mode == DBMODE.Insert"
        placeholder="Copy from user"
        v-model:lookupKey="copyUser"
        @update:model-value="copyPermissions"
        name="user"
        class="w-64 mt-4"
    />
    <DBLookup
        v-if="mode == DBMODE.Insert"
        placeholder="Copy from company"
        v-model:lookupKey="copyComCode"
        name="company"
        class="w-80 mt-4"
        @update:model-value="copyPermissions"
    />
</template>

<script lang="ts" setup>
definePageMeta({ keepalive: true })

import { DBMODE, LEVELS, LEVEL_ITEMS } from "~~/shared/utils"
import type { NavigationMenuItem } from "@nuxt/ui"

const { $waitFetch } = useNuxtApp()
const { user } = useUserSession()
const search: Ref<string> = ref(user.value.id)
const comCode = ref<string>("00")

onActivated(async () => {
    const route = useRoute()
    search.value = route.query.userId || user.value.id
    comCode.value = route.query.comCode || user.value.comCode
    await onSelect()
})

const copyUser = ref<string>("")
const mode = ref(DBMODE.Idle)
const copyComCode = ref<string>("")
const permissions = ref<NavigationMenuItem[]>([])
const menuItem = ref()
const { activeMenu, permissionsToMenu, permissionsFromMenu, countPermissions } = usePayrollMenu()

const count = computed((): number => {
    return countPermissions(permissions.value)
})

function newRecord(): void {
    copyUser.value = ""
    copyComCode.value = comCode.value
}

async function onSelect() {
    if (!search.value || !comCode.value) return
    permissions.value = await permissionsToMenu(comCode.value, search.value, LEVELS.Viewer)
}

async function onUpdate() {
    return await $waitFetch("/api/permission", {
        method: "PUT",
        body: {
            comCode: comCode.value,
            userId: search.value,
            permissions: permissionsFromMenu(comCode.value, search.value, permissions.value),
        },
    })
}

async function onDelete() {
    permissions.value = []
    return await onUpdate()
}

const onInsert = async () => onUpdate()

function onPrint() {}

function updateLevel(item: number | null) {
    for (const subMenu of permissions.value)
        for (const child of subMenu.children!)
            if (child.to == menuItem.value.to) {
                child.level = item
                return
            }
}

async function copyPermissions() {
    if (!copyUser.value || !copyComCode.value) return
    if (copyUser.value === search.value && copyComCode.value === comCode.value) return
    permissions.value = await permissionsToMenu(copyComCode.value, copyUser.value, LEVELS.Viewer)
}

</script>
