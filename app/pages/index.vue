<template>
    <div class="w-full p-6">
        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                Employee Directory
            </h1>

            <!-- Search Filters -->
            <div
                class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <UInput
                    v-model="filters.name"
                    placeholder="Search name..."
                    icon="i-lucide-search"
                    @update:model-value="debouncedSearch" />
                <UInput
                    v-model="filters.surname"
                    placeholder="Search surname..."
                    icon="i-lucide-search"
                    @update:model-value="debouncedSearch" />
                <UInput
                    v-model="filters.nickName"
                    placeholder="Search nickname..."
                    icon="i-lucide-search"
                    @update:model-value="debouncedSearch" />
                <UInput v-model.number="filters.age" type="number" placeholder="Search age..." />
                <UInput
                    v-model="filters.department"
                    placeholder="Search department..."
                    icon="i-lucide-search"
                    @update:model-value="debouncedSearch" />
            </div>
        </div>

        <!-- Loading & Error States -->
        <div v-if="loading" class="text-center py-12">
            <UIcon
                name="i-lucide-loader"
                class="inline-block animate-spin text-4xl text-blue-600" />
            <p class="mt-4 text-gray-600 dark:text-gray-400">Loading employees...</p>
        </div>
        <div
            v-else-if="error"
            class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-400">
            {{ error }}
        </div>
        <div v-else-if="groupedEmployees.length === 0" class="text-center py-12">
            <p class="text-gray-600 dark:text-gray-400">No active employees found.</p>
        </div>

        <!-- Employees Grouped by Company -->
        <div v-else class="space-y-8">
            <div v-for="group in groupedEmployees" :key="group.comCode" class="space-y-4">
                <h2
                    class="text-2xl font-bold text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-600 pb-2">
                    {{ group.comName }}
                </h2>

                <!-- Employee Cards Grid -->
                <div class="flex flex-wrap gap-3">
                    <div
                        v-for="emp in group.employees"
                        :key="`${emp.comCode}-${emp.empCode}`"
                        :class="[
                            'flex h-20 w-60 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden',
                            user.value && emp.comCode === user.value.comCode
                                ? 'cursor-pointer'
                                : '',
                        ]"
                        @click="onCardClick(emp)">
                        <div
                            class="h-20 w-16 bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-r border-gray-200 dark:border-gray-700">
                            <img
                                v-if="emp.hasPhoto"
                                :src="getPhotoUrl(emp.comCode, emp.empCode, true)"
                                alt="Employee photo"
                                class="w-16 h-16 object-cover rounded-sm" />
                            <div v-else class="text-gray-300 dark:text-gray-600">
                                <UIcon name="i-lucide-user" class="inline-block text-2xl" />
                            </div>
                        </div>

                        <!-- Info -->
                        <div class="flex-1 p-2 flex flex-col justify-center overflow-hidden">
                            <h3
                                class="text-xs font-semibold text-gray-900 dark:text-white truncate">
                                {{ emp.prefix || "" }} {{ emp.name }} {{ emp.surName }}
                            </h3>
                            <p
                                v-if="emp.nickName"
                                class="text-xs text-gray-600 dark:text-gray-400 truncate">
                                "{{ emp.nickName }}"
                            </p>
                            <div class="text-xs text-gray-500 dark:text-gray-400 space-y-0">
                                <p v-if="emp.department" class="truncate">{{ emp.department }}</p>
                                <p>Age: {{ calculateAge(emp.birthDate) }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, computed, reactive, onMounted } from "vue"
import { useRouter } from "vue-router"
import { getPhotoUrl, calculateAge } from "~~/shared/utils"

interface Employee {
    comCode: string
    comName?: string
    empCode: number
    prefix?: string
    name: string
    surName: string
    nickName?: string
    birthDate?: string
    department?: string
    endDate?: string
    hasPhoto?: boolean
}

interface EmployeeGroup {
    comCode: string
    comName: string
    employees: Employee[]
}

const { $waitFetch } = useNuxtApp()
const router = useRouter()
const { user } = useUserSession()
const loading = ref(true)
const error = ref<string | null>(null)
const allEmployees = ref<Employee[]>([])

let searchTimeout: ReturnType<typeof setTimeout> | null = null

const filters = reactive({
    name: "",
    surname: "",
    nickName: "",
    age: null as number | null,
    department: "",
})

// Fetch all active employees
async function fetchEmployees() {
    loading.value = true
    error.value = null
    try {
        allEmployees.value = await $waitFetch("/api/employee/active")
    } catch (err: any) {
        error.value = err.statusMessage || "Failed to load employees"
    } finally {
        loading.value = false
    }
}

// Filter and group employees
const groupedEmployees = computed(() => {
    const minLength = 3

    // If any text filter is present but shorter than minLength, return empty results
    const hasMeaningFilter =
        filters.name.length >= minLength ||
        filters.surname.length >= minLength ||
        filters.nickName.length >= minLength ||
        filters.department.length >= minLength

    let filtered = hasMeaningFilter
        ? allEmployees.value.filter((emp) => {
              const nameMatch = emp.name.toLowerCase().includes(filters.name.toLowerCase())
              const surnameMatch = emp.surName.toLowerCase().includes(filters.surname.toLowerCase())
              const nickMatch =
                  !filters.nickName ||
                  (emp.nickName?.toLowerCase().includes(filters.nickName.toLowerCase()) ?? false)
              const ageMatch = !filters.age || calculateAge(emp.birthDate) === filters.age
              const deptMatch =
                  !filters.department ||
                  (emp.department?.toLowerCase().includes(filters.department.toLowerCase()) ?? true)

              return nameMatch && surnameMatch && nickMatch && ageMatch && deptMatch
          })
        : allEmployees.value

    // Group by company code
    const grouped = new Map<string, Employee[]>()
    filtered.forEach((emp) => {
        if (!grouped.has(emp.comCode)) {
            grouped.set(emp.comCode, [])
        }
        grouped.get(emp.comCode)!.push(emp)
    })

    // Convert to array, sort by age desc, and sort
    return Array.from(grouped.entries())
        .map(([comCode, employees]) => ({
            comCode,
            comName: employees[0]?.comName || comCode,
            employees: employees.sort(
                (a, b) => calculateAge(b.birthDate) - calculateAge(a.birthDate),
            ),
        }))
        .sort((a, b) => a.comCode.localeCompare(b.comCode))
})

// Debounced search trigger
function debouncedSearch() {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        // no-op; computed property will react to filters
    }, 500)
}

function onCardClick(emp: Employee) {
    if (emp.comCode === user.value.comCode) {
        router.push({ path: "/employee", query: { empCode: String(emp.empCode) } })
    }
}

// Navigate to employee detail and pre-select
function setSelectedEmployee(emp: Employee) {
    sessionStorage.setItem("selectedEmployee", JSON.stringify(emp))
}

onMounted(() => {
    fetchEmployees()
})
</script>
