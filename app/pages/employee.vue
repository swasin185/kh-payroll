<template>
    <ToolbarData
        lookupName="employee"
        v-model:searchKey="search"
        v-model:mode="mode"
        :newRecord="() => Object.assign(record, EmployeeSchema.parse({}))"
        :onSelect="onSelect"
        :onInsert="onInsert"
        :onUpdate="onUpdate"
        :onDelete="onDelete"
        :onPrint="onPrint"
        :form="form!"
    />
    <UForm
        ref="form"
        :state="record"
        :schema="EmployeeSchema"
        class="grid grid-flow-col grid-rows-6 gap-y-2"
        :disabled="mode !== DBMODE.Insert && mode !== DBMODE.Update"
    >
        <UFormField label="Employee Code" name="empCode">
            <UInput
                type="number"
                v-model="record.empCode"
                disabled
                class="w-20"
            />
        </UFormField>
        <UFormField label="เลขที่ผู้เสียภาษี" name="taxId">
            <UInput type="text" v-model="record.taxId" class="w-40" />
        </UFormField>
        <UFormField label="คำนำหน้า" name="prefix">
            <USelect
                type="text"
                v-model="record.prefix"
                :items="[null, 'นาย', 'นาง', 'นางสาว']"
                class="w-30"
            />
        </UFormField>
        <UFormField label="ชื่อ" name="name">
            <UInput type="text" v-model="record.name" class="w-30" />
        </UFormField>
        <UFormField label="นามสกุล" name="surName">
            <UInput type="text" v-model="record.surName" class="w-50" />
        </UFormField>
        <UFormField label="ชื่อเล่น" name="nickName">
            <UInput type="text" v-model="record.nickName" class="w-30" />
        </UFormField>
        <UFormField label="วันเกิด" name="birthDate">
            <DateInput v-model="record.birthDate" />
        </UFormField>
        <UFormField label="แผนก ฝ่าย" name="department">
            <UInput type="text" v-model="record.department" class="w-30" />
        </UFormField>
        <UFormField label="timetype code" name="timeCode">
            <UInput type="number" v-model="record.timeCode" class="w-20" />
        </UFormField>
        <UFormField label="วันที่เริ่มงาน" name="beginDate">
            <DateInput v-model="record.beginDate" />
        </UFormField>
        <UFormField label="วันที่ออกจากงาน" name="endDate">
            <DateInput v-model="record.endDate" />
        </UFormField>
        <UFormField label="เลขที่บัญชีธนาคาร" name="bankAccount">
            <UInput type="text" v-model="record.bankAccount" class="w-40" />
        </UFormField>
        <UFormField label="ประเภทพนักงาน" name="empType">
            <USelect
                type="text"
                v-model="record.empType"
                :items="[null, 'ประจำ', 'ชั่วคราว', 'ฝึกงาน']"
                class="w-30"
            />
        </UFormField>
        <UFormField label="ที่อยู่" name="address" class="w-80">
            <UInput type="text" v-model="record.address" />
        </UFormField>
        <UFormField label="เบอร์โทรศัพท์" name="phone" class="w-40">
            <UInput type="text" v-model="record.phone" />
        </UFormField>
        <UFormField label="จำนวนบุตรทั้งหมด" name="childAll">
            <UInputNumber v-model="record.childAll" class="w-32" />
        </UFormField>
        <UFormField label="จำนวนบุตรกำลังศึกษา" name="childEdu">
            <UInputNumber v-model="record.childEdu" class="w-32" />
        </UFormField>
        <UFormField label="รหัสสแกน" name="scanCode">
            <UInput type="text" v-model="record.scanCode" class="w-20" />
        </UFormField>
        <UFormField label="ลดหย่อนคู่สมรส" name="isSpouse">
            <USwitch v-model="record.isSpouse" class="w-30" />
        </UFormField>
        <UFormField label="ลดหย่อนบุตรร่วม" name="isChildShare">
            <USwitch v-model="record.isChildShare" class="w-30" />
        </UFormField>
        <UFormField label="ยกเว้นประกันสังคม" name="isExcSocialIns">
            <USwitch v-model="record.isExcSocialIns" class="w-30" />
        </UFormField>
        <UFormField label="ลดหย่อนประกันชีวิต" name="deductInsure">
            <MoneyInput v-model="record.deductInsure" />
        </UFormField>
        <UFormField label="ลดหย่อนผ่อนที่อยู่อาศัย" name="deductHome">
            <MoneyInput v-model="record.deductHome" />
        </UFormField>
        <UFormField label="ลดหย่อนอื่นๆ" name="deductElse">
            <MoneyInput v-model="record.deductElse" />
        </UFormField>
    </UForm>
</template>
<script lang="ts" setup>
definePageMeta({ keepalive: true })

import { EmployeeSchema, type Employee } from "~~/shared/schema"
import { DBMODE } from "~~/shared/utils"

const form = useTemplateRef("form")
const { $waitFetch } = useNuxtApp()
const search: Ref<string> = ref("")
const mode = ref(DBMODE.Idle)
const record = reactive<Employee>(EmployeeSchema.parse({}))

const { user } = useUserSession()
const comCode = ref(user.value.comCode)

async function onSelect() {
    Object.assign(
        record,
        await $waitFetch("/api/employee", {
            method: "GET",
            query: { comCode: comCode.value, empCode: search.value },
        }),
    )
}

async function onInsert() {
    return await $waitFetch("/api/employee", {
        method: "POST",
        body: record,
    })
}

async function onUpdate() {
    return await $waitFetch("/api/employee", {
        method: "PUT",
        body: record,
    })
}

async function onDelete() {
    await $waitFetch("/api/employee", {
        method: "DELETE",
        query: { inCode: search.value },
    })
}

function onPrint() {}
</script>
