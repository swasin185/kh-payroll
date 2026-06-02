<template>
    <ToolbarData
        lookupName=""
        dialogName="Employee"
        v-model:searchKey="search"
        v-model:mode="mode"
        :newRecord="newRecord"
        :onSelect="onSelect"
        :onInsert="onInsert"
        :onUpdate="onUpdate"
        :onDelete="onDelete"
        :onPrint="onPrint"
        :form="form!" />

    <div class="flex flex-col lg:flex-row gap-6 mt-1 items-start w-full">
        <!-- Employee Photo Card -->
        <!-- Employee Info Form -->
        <UForm
            ref="form"
            :state="record"
            :schema="EmployeeSchema"
            class="flex-1 grid grid-flow-col grid-rows-6 gap-y-2 gap-x-4 w-full"
            :disabled="mode !== DBMODE.Insert && mode !== DBMODE.Update">
            <UFormField label="Employee Code" name="empCode">
                <UInput type="number" v-model="record.empCode" disabled class="w-20" />
            </UFormField>
            <UFormField label="คำนำหน้า" name="prefix">
                <USelect
                    type="text"
                    v-model="record.prefix"
                    :items="[null, 'นาย', 'นาง', 'นางสาว']"
                    class="w-30" />
            </UFormField>
            <UFormField label="ชื่อ" name="name">
                <UInput type="text" v-model="record.name!" class="w-30" />
            </UFormField>
            <UFormField label="นามสกุล" name="surName">
                <UInput type="text" v-model="record.surName!" class="w-50" />
            </UFormField>
            <UFormField label="ชื่อเล่น" name="nickName">
                <UInput type="text" v-model="record.nickName!" class="w-30" />
            </UFormField>
            <UFormField label="เลขที่ผู้เสียภาษี" name="taxId">
                <UInput type="text" v-model="record.taxId!" class="w-40" />
            </UFormField>
            <UFormField label="วันเกิด" name="birthDate">
                <DateInput v-model="record.birthDate" />
            </UFormField>
            <UFormField label="แผนก ฝ่าย" name="department">
                <UInput type="text" v-model="record.department!" class="w-30" />
            </UFormField>
            <UFormField label="timetype code" name="timeCode">
                <UInput type="number" v-model="record.timeCode!" class="w-20" />
            </UFormField>
            <UFormField label="วันที่เริ่มงาน" name="beginDate">
                <DateInput v-model="record.beginDate" />
            </UFormField>
            <UFormField label="วันที่ออกจากงาน" name="endDate">
                <DateInput v-model="record.endDate" />
            </UFormField>
            <UFormField label="เลขที่บัญชีธนาคาร" name="bankAccount">
                <UInput type="text" v-model="record.bankAccount!" class="w-40" />
            </UFormField>
            <UFormField label="ประเภทพนักงาน" name="empType">
                <USelect
                    type="text"
                    v-model="record.empType"
                    :items="[null, 'ประจำ', 'ชั่วคราว', 'ฝึกงาน']"
                    class="w-30" />
            </UFormField>
            <UFormField label="ที่อยู่" name="address" class="w-80">
                <UInput type="text" v-model="record.address!" />
            </UFormField>
            <UFormField label="เบอร์โทรศัพท์" name="phone" class="w-40">
                <UInput type="text" v-model="record.phone!" />
            </UFormField>
            <UFormField label="จำนวนบุตรทั้งหมด" name="childAll">
                <UInputNumber v-model="record.childAll" class="w-32" />
            </UFormField>
            <UFormField label="จำนวนบุตรกำลังศึกษา" name="childEdu">
                <UInputNumber v-model="record.childEdu" class="w-32" />
            </UFormField>
            <UFormField label="รหัสสแกน" name="scanCode">
                <UInput type="text" v-model="record.scanCode!" class="w-20" />
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

        <div
            class="w-full lg:w-1/4 border border-gray-200 dark:border-gray-700 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 flex flex-col items-center shadow-sm">
            <div
                :class="[
                    'h-48 w-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-white dark:bg-gray-900 overflow-hidden relative shadow-inner',
                    hasPhoto && 'cursor-pointer hover:opacity-80 transition-opacity',
                ]"
                @click="hasPhoto && openPhotoModal()">
                <img v-if="hasPhoto" :src="photoUrl" class="object-cover h-full w-full" />
                <div v-else class="text-center p-4">
                    <span class="text-xs text-gray-400 block font-medium">ไม่มีรูปถ่าย</span>
                    <span class="text-[10px] text-gray-400 block mt-1"
                        >(ขนาด &lt; {{ photoSize }}x{{ photoSize }}, {{ fileSize }}KB)</span
                    >
                </div>
            </div>

            <div
                class="mt-1 flex gap-2 w-full justify-center"
                v-if="record.comCode && record.empCode">
                <input
                    type="file"
                    id="employee-photo-file"
                    class="hidden"
                    accept="image/*"
                    @change="uploadPhoto" />
                <label
                    for="employee-photo-file"
                    class="cursor-pointer text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium rounded shadow p-2">
                    {{ hasPhoto ? "เปลี่ยนรูป" : "อัปโหลดรูป" }}
                </label>
                <button
                    v-if="hasPhoto"
                    @click="deletePhoto"
                    class="text-xs bg-red-600 hover:bg-red-700 text-white font-medium rounded shadow p-2">
                    ลบรูปถ่าย
                </button>
            </div>
            <div class="mt-4 text-xs text-gray-400 text-center" v-else>
                เลือกพนักงานก่อนอัปโหลดรูปภาพ
            </div>
        </div>
    </div>

    <!-- Photo Modal -->
    <div
        v-if="isPhotoModalOpen"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click="closePhotoModal">
        <div @click.stop>
            <button @click="closePhotoModal">✕</button>
            <img :src="photoUrl" class="w-full h-auto" />
        </div>
    </div>
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

// Photo handling state & derived properties
const fileSize = 250
const photoSize = 600
const hasPhoto = ref(false)
const photoVersion = ref(0)
const isPhotoModalOpen = ref(false)
const photoUrl = computed(
    () =>
        `/api/employee/photo?comCode=${record.comCode}&empCode=${record.empCode}&t=${photoVersion.value}`,
)

// Monitor changes to active employee to load their photo metadata
watch(
    () => [record.comCode, record.empCode],
    async ([newCom, newEmp]) => {
        if (newCom && newEmp) {
            try {
                const metadata: any = await $fetch(`/api/employee/photo`, {
                    query: { comCode: newCom, empCode: newEmp, metadata: "1" },
                })
                hasPhoto.value = !!metadata.hasPhoto
                photoVersion.value++
            } catch {
                hasPhoto.value = false
            }
        } else {
            hasPhoto.value = false
        }
    },
    { immediate: true },
)

async function uploadPhoto(event: Event) {
    const input = event.target as HTMLInputElement
    if (!input.files || input.files.length === 0) return

    const file = input.files[0]!

    if (file.size >= fileSize * 1024) {
        alert("ขนาดไฟล์ต้องน้อยกว่า " + fileSize + "KB")
        return
    }

    const isValidDimensions = await new Promise<boolean>((resolve) => {
        const img = new Image()
        img.src = URL.createObjectURL(file)
        img.onload = () => {
            URL.revokeObjectURL(img.src)
            resolve(img.width < photoSize && img.height < photoSize)
        }
        img.onerror = () => resolve(false)
    })

    if (!isValidDimensions) {
        alert("มิติต้องน้อยกว่า " + photoSize + "x" + photoSize + " พิกเซล")
        return
    }

    const formData = new FormData()
    formData.append("comCode", record.comCode)
    formData.append("empCode", record.empCode.toString())
    formData.append("photo", file)

    try {
        await $waitFetch("/api/employee/photo", {
            method: "POST",
            body: formData,
        })
        hasPhoto.value = true
        photoVersion.value++
    } catch (err: any) {
        alert(err.statusMessage || "เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ")
    }
}

async function deletePhoto() {
    if (!confirm("คุณต้องการลบรูปภาพพนักงานใช่หรือไม่?")) return

    try {
        await $waitFetch("/api/employee/photo", {
            method: "DELETE",
            query: { comCode: record.comCode, empCode: record.empCode },
        })
        hasPhoto.value = false
        photoVersion.value++
    } catch (err: any) {
        alert(err.statusMessage || "เกิดข้อผิดพลาดในการลบรูปภาพ")
    }
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
    return await $waitFetch("/api/employee", {
        method: "DELETE",
        query: { comCode: comCode.value, empCode: search.value },
    })
}

function onPrint() {}

function openPhotoModal() {
    isPhotoModalOpen.value = true
}

function closePhotoModal() {
    isPhotoModalOpen.value = false
}

function newRecord() {
    let rec = EmployeeSchema.parse({})
    rec.comCode = user.value.comCode
    Object.assign(record, rec)
    hasPhoto.value = false
}
</script>
