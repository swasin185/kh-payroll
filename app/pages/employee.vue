<template>
    <ToolbarData
        lookupName="employee"
        v-model:searchKey="search"
        v-model:mode="mode"
        :newRecord="newRecord"
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
        class="grid grid-flow-col grid-rows-8 gap-x-4 gap-y-2"
        :disabled="mode !== DBMODE.Insert && mode !== DBMODE.Update"
    >
        <UFormField label="Employee Code" name="empCode" class="w-30">
            <UInput type="number" v-model="record.empCode" :disabled="mode !== DBMODE.Insert" />
        </UFormField>
        <UFormField label="เลขที่ผู้เสียภาษี" name="taxId" class="w-40">
            <UInput type="text" v-model="record.taxId" />
        </UFormField>
        <UFormField label="คำนำหน้า" name="prefix" class="w-25">
            <UInput type="text" v-model="record.prefix" />
        </UFormField>
        <UFormField label="ชื่อ" name="name" class="w-40">
            <UInput type="text" v-model="record.name" />
        </UFormField>
        <UFormField label="นามสกุล" name="surName" class="w-50">
            <UInput type="text" v-model="record.surName" />
        </UFormField>
        <UFormField label="ชื่อเล่น" name="nickName" class="w-30">
            <UInput type="text" v-model="record.nickName" />
        </UFormField>
        <UFormField label="แผนก ฝ่าย" name="department" class="w-30">
            <UInput type="text" v-model="record.department" />
        </UFormField>
        <UFormField label="timetype code" name="timeCode" class="w-20">
            <UInput type="text" v-model="record.timeCode" />
        </UFormField>
        <UFormField label="วันที่เริ่มงาน" name="beginDate">
            <DateInput v-model="record.beginDate" />
        </UFormField>
        <UFormField label="วันที่ออกจากงาน" name="endDate">
            <DateInput v-model="record.endDate" />
        </UFormField>
        <UFormField label="เลขที่บัญชีธนาคาร" name="bankAccount" class="w-40">
            <UInput type="text" v-model="record.bankAccount" />
        </UFormField>
        <UFormField label="ประเภทพนักงาน ประจำ/ชั่วคราว/ฝึกงาน" name="empType" class="w-40">
            <UInput type="text" v-model="record.empType" />
        </UFormField>
        <UFormField label="ที่อยู่" name="address" class="w-40">
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
        <UFormField label="ลดหย่อนคู่สมรสหรือไม่" name="isSpouse" class="w-30">
            <USwitch v-model="record.isSpouse" />
        </UFormField>
        <UFormField label="ลดหย่อนบุตรแบ่งครึ่งหรือไม่" name="isChildShare" class="w-30">
            <USwitch v-model="record.isChildShare" />
        </UFormField>
        <UFormField label="ยกเว้นประกันสังคมหรือไม่" name="isExcSocialIns" class="w-30">
            <USwitch v-model="record.isExcSocialIns" />
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
        <UFormField label="รหัสสแกนลายนิ้วมือ" name="scanCode" class="w-20">
            <UInput type="text" v-model="record.scanCode" />
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

function newRecord(): void {
    Object.assign(record, EmployeeSchema.parse({}))
}

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
