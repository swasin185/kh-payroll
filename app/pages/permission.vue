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
        :onLookup="onLookup"
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
    <UTree
        class="w-100"
        :items="permissions"
        v-model="menuItem"
        selectionBehavior="replace"
        :disabled="mode !== DBMODE.Update"
    >
        <template #item-trailing="{ item }">
            <UBadge v-if="!item.children" class="w-8 m-0 p-1" :label="item.badge as any" />
            <USelect
                v-if="!item.children"
                class="w-32 m-0 p-1"
                :model-value="item.level"
                :items="LEVEL_ITEMS"
                @update:model-value="updateLevel"
                :disabled="item.to != menuItem.to"
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
import { DBMODE, LEVELS, LEVEL_ITEMS } from "~~/shared/utils"
import type { TreeItem, NavigationMenuItem } from "@nuxt/ui"

const { $waitFetch } = useNuxtApp()
const { user } = useUserSession()
const search: Ref<string> = ref(user.value.id)
const copyUser = ref<string>("")
const mode = ref(DBMODE.Idle)
const comCode = ref<string>("00")
const copyComCode = ref<string>("")
const toast = useToast()
const permissions = ref<NavigationMenuItem[]>([])
const menuItem = ref<TreeItem>({})
const { activeMenu, permissionsToMenu, permissionsFromMenu, countPermissions } = usePayrollMenu()
const isNotAdmin = computed(() => activeMenu.value.level < 9)
const count = computed((): number => {
    return countPermissions(permissions.value)
})

const newRecord = () => {
    copyUser.value = ""
    copyComCode.value = comCode.value
}

const onSelect = async () => {
    if (!search.value) search.value = user.value.id
    permissions.value = await permissionsToMenu(comCode.value, search.value, LEVELS.Viewer)
}

const onUpdate = async () => {
    return await $waitFetch("/api/permission", {
        method: "PUT",
        body: {
            comCode: comCode.value,
            userId: search.value,
            permissions: permissionsFromMenu(comCode.value, search.value, permissions.value),
        },
    })
}

const onDelete = async () => {
    permissions.value = []
    return await onUpdate()
}

const onInsert = onUpdate

const onLookup = async () => {
    // searchKey.value = await useLookupDialog("", searchKey.value) || searchKey.value
}
const onPrint = async () => {}

const updateLevel = (item: number | null) => {
    for (const subMenu of permissions.value)
        for (const child of subMenu.children!)
            if (child.to == menuItem.value.to) {
                child.level = item
                return
            }
}

const copyPermissions = async () => {
    if (!copyUser.value || !copyComCode.value) return
    if (copyUser.value === search.value && copyComCode.value === comCode.value) return
    permissions.value = await permissionsToMenu(copyComCode.value, copyUser.value, LEVELS.Viewer)
}

await onSelect()
</script>
