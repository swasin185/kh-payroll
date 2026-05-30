<template>
    <div class="flex flex-col gap-4 w-full p-2">
        <!-- Dashboard Header -->
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    <UIcon name="i-lucide-layout-dashboard" class="size-7 mr-1 align-middle" />
                    HR Dashboard
                </h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {{ todayDisplay }} — ภาพรวมบุคลากร
                </p>
            </div>
            <div class="flex gap-2">
                <UButton icon="i-lucide-refresh-cw" variant="outline" size="sm" @click="refreshData" :loading="isRefreshing">
                    รีเฟรช
                </UButton>
                <UButton icon="i-lucide-download" variant="soft" size="sm">
                    ส่งออกรายงาน
                </UButton>
            </div>
        </div>

        <!-- KPI Stat Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <UCard v-for="stat in stats" :key="stat.label"
                :class="['transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border-l-4', stat.borderColor]">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            {{ stat.label }}
                        </p>
                        <p class="text-3xl font-extrabold mt-1" :class="stat.textColor">
                            {{ stat.value }}
                        </p>
                        <div class="flex items-center gap-1 mt-1">
                            <UIcon :name="stat.trendIcon" class="size-3.5" :class="stat.trendColor" />
                            <span class="text-xs" :class="stat.trendColor">{{ stat.trend }}</span>
                            <span class="text-xs text-gray-400">vs เดือนก่อน</span>
                        </div>
                    </div>
                    <div :class="['rounded-xl p-3', stat.iconBg]">
                        <UIcon :name="stat.icon" class="size-7" :class="stat.iconColor" />
                    </div>
                </div>
            </UCard>
        </div>

        <!-- Main Content: 2-column layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <!-- Left Column (2/3) -->
            <div class="lg:col-span-2 flex flex-col gap-4">

                <!-- Department Breakdown -->
                <UCard>
                    <template #header>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <UIcon name="i-lucide-building-2" class="size-5 text-blue-500" />
                                <span class="font-semibold text-gray-800 dark:text-gray-100">สัดส่วนพนักงานตามแผนก</span>
                            </div>
                            <UBadge color="info" variant="subtle" size="sm">{{ departments.length }} แผนก</UBadge>
                        </div>
                    </template>
                    <div class="space-y-3">
                        <div v-for="dept in departments" :key="dept.name" class="group">
                            <div class="flex items-center justify-between mb-1">
                                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ dept.name }}</span>
                                <div class="flex items-center gap-2">
                                    <span class="text-sm font-bold" :class="dept.color">{{ dept.count }}</span>
                                    <span class="text-xs text-gray-400">คน</span>
                                    <UBadge :color="dept.badgeColor" variant="soft" size="xs">
                                        {{ dept.percentage }}%
                                    </UBadge>
                                </div>
                            </div>
                            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                                <div class="h-2.5 rounded-full transition-all duration-700 group-hover:opacity-80"
                                    :class="dept.barColor"
                                    :style="{ width: dept.percentage + '%' }">
                                </div>
                            </div>
                        </div>
                    </div>
                </UCard>

                <!-- Today's Attendance Table -->
                <UCard>
                    <template #header>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <UIcon name="i-lucide-clock" class="size-5 text-emerald-500" />
                                <span class="font-semibold text-gray-800 dark:text-gray-100">การเข้างานวันนี้</span>
                            </div>
                            <div class="flex gap-2">
                                <UBadge color="success" variant="soft" size="sm">
                                    <UIcon name="i-lucide-check-circle" class="size-3 mr-1" />
                                    มาทำงาน {{ presentCount }}
                                </UBadge>
                                <UBadge color="error" variant="soft" size="sm">
                                    <UIcon name="i-lucide-x-circle" class="size-3 mr-1" />
                                    ขาด/ลา {{ absentCount }}
                                </UBadge>
                            </div>
                        </div>
                    </template>
                    <UTable :data="attendanceData" :columns="attendanceColumns" class="h-64" />
                </UCard>
            </div>

            <!-- Right Column (1/3) -->
            <div class="flex flex-col gap-4">

                <!-- Attendance Donut Summary -->
                <UCard>
                    <template #header>
                        <div class="flex items-center gap-2">
                            <UIcon name="i-lucide-pie-chart" class="size-5 text-violet-500" />
                            <span class="font-semibold text-gray-800 dark:text-gray-100">สรุปวันนี้</span>
                        </div>
                    </template>
                    <div class="flex flex-col items-center">
                        <!-- CSS Donut Chart -->
                        <div class="relative w-40 h-40 mb-4">
                            <svg viewBox="0 0 36 36" class="w-full h-full transform -rotate-90">
                                <circle cx="18" cy="18" r="14" fill="none" stroke-width="4"
                                    class="stroke-gray-200 dark:stroke-gray-700" />
                                <circle cx="18" cy="18" r="14" fill="none" stroke-width="4"
                                    stroke-dasharray="88 0" stroke-linecap="round"
                                    class="stroke-emerald-500 transition-all duration-1000" />
                                <circle cx="18" cy="18" r="14" fill="none" stroke-width="4"
                                    :stroke-dasharray="`0 ${presentPercent * 0.88} ${latePercent * 0.88} ${100 * 0.88}`"
                                    stroke-linecap="round"
                                    class="stroke-amber-500 transition-all duration-1000" />
                                <circle cx="18" cy="18" r="14" fill="none" stroke-width="4"
                                    :stroke-dasharray="`0 ${(presentPercent + latePercent) * 0.88} ${absentPercent * 0.88} ${100 * 0.88}`"
                                    stroke-linecap="round"
                                    class="stroke-red-500 transition-all duration-1000" />
                            </svg>
                            <div class="absolute inset-0 flex flex-col items-center justify-center">
                                <span class="text-2xl font-extrabold text-gray-800 dark:text-gray-100">{{ presentPercent }}%</span>
                                <span class="text-xs text-gray-500">เข้างาน</span>
                            </div>
                        </div>
                        <div class="flex gap-4 text-xs">
                            <div class="flex items-center gap-1">
                                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                                ปกติ {{ normalCount }}
                            </div>
                            <div class="flex items-center gap-1">
                                <span class="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                                สาย {{ lateCount }}
                            </div>
                            <div class="flex items-center gap-1">
                                <span class="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                                ขาด/ลา {{ absentCount }}
                            </div>
                        </div>
                    </div>
                </UCard>

                <!-- Pending Leave Requests -->
                <UCard>
                    <template #header>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-2">
                                <UIcon name="i-lucide-calendar-x" class="size-5 text-amber-500" />
                                <span class="font-semibold text-gray-800 dark:text-gray-100">คำขอลาล่าสุด</span>
                            </div>
                            <UBadge color="warning" variant="soft" size="sm">{{ leaveRequests.length }} รายการ</UBadge>
                        </div>
                    </template>
                    <div class="space-y-3">
                        <div v-for="req in leaveRequests" :key="req.id"
                            class="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                            <div class="flex items-center gap-3">
                                <UAvatar :text="req.initials" size="sm" :class="req.avatarClass" />
                                <div>
                                    <p class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ req.name }}</p>
                                    <p class="text-xs text-gray-500">{{ req.type }} · {{ req.dates }}</p>
                                </div>
                            </div>
                            <UBadge :color="req.statusColor" variant="subtle" size="xs">
                                {{ req.status }}
                            </UBadge>
                        </div>
                    </div>
                </UCard>

                <!-- Upcoming Events -->
                <UCard>
                    <template #header>
                        <div class="flex items-center gap-2">
                            <UIcon name="i-lucide-calendar-days" class="size-5 text-pink-500" />
                            <span class="font-semibold text-gray-800 dark:text-gray-100">เหตุการณ์สำคัญ</span>
                        </div>
                    </template>
                    <div class="space-y-3">
                        <div v-for="event in upcomingEvents" :key="event.id"
                            class="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <div :class="['rounded-lg p-2 text-center min-w-12', event.dateBg]">
                                <p class="text-xs font-bold" :class="event.dateColor">{{ event.month }}</p>
                                <p class="text-lg font-extrabold leading-tight" :class="event.dateColor">{{ event.day }}</p>
                            </div>
                            <div>
                                <p class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ event.title }}</p>
                                <p class="text-xs text-gray-500">{{ event.description }}</p>
                            </div>
                        </div>
                    </div>
                </UCard>

                <!-- Quick Actions -->
                <UCard>
                    <template #header>
                        <div class="flex items-center gap-2">
                            <UIcon name="i-lucide-zap" class="size-5 text-yellow-500" />
                            <span class="font-semibold text-gray-800 dark:text-gray-100">เมนูลัด</span>
                        </div>
                    </template>
                    <div class="grid grid-cols-2 gap-2">
                        <UButton v-for="action in quickActions" :key="action.label"
                            :icon="action.icon" :to="action.to" variant="soft" :color="action.color"
                            size="sm" block class="justify-start">
                            {{ action.label }}
                        </UButton>
                    </div>
                </UCard>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
// -- Demo Data & Logic (UI only, no API calls) --

const now = new Date()
const todayDisplay = computed(() =>
    now.toLocaleDateString("th-TH", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    }),
)

const isRefreshing = ref(false)
function refreshData() {
    isRefreshing.value = true
    setTimeout(() => (isRefreshing.value = false), 1200)
}

// ── KPI Stats ──
const totalEmployees = 156
const presentCount = 132
const absentCount = 12
const lateCount = 12
const normalCount = presentCount - lateCount

const presentPercent = Math.round((presentCount / totalEmployees) * 100)
const latePercent = Math.round((lateCount / totalEmployees) * 100)
const absentPercent = Math.round((absentCount / totalEmployees) * 100)

const stats = [
    {
        label: "พนักงานทั้งหมด",
        value: totalEmployees,
        icon: "i-lucide-users",
        trend: "+3",
        trendIcon: "i-lucide-trending-up",
        trendColor: "text-emerald-500",
        textColor: "text-blue-600 dark:text-blue-400",
        borderColor: "border-blue-500",
        iconBg: "bg-blue-50 dark:bg-blue-900/30",
        iconColor: "text-blue-500",
    },
    {
        label: "มาทำงานวันนี้",
        value: presentCount,
        icon: "i-lucide-user-check",
        trend: "+5",
        trendIcon: "i-lucide-trending-up",
        trendColor: "text-emerald-500",
        textColor: "text-emerald-600 dark:text-emerald-400",
        borderColor: "border-emerald-500",
        iconBg: "bg-emerald-50 dark:bg-emerald-900/30",
        iconColor: "text-emerald-500",
    },
    {
        label: "ขาด / ลา",
        value: absentCount,
        icon: "i-lucide-user-x",
        trend: "-2",
        trendIcon: "i-lucide-trending-down",
        trendColor: "text-red-500",
        textColor: "text-red-600 dark:text-red-400",
        borderColor: "border-red-500",
        iconBg: "bg-red-50 dark:bg-red-900/30",
        iconColor: "text-red-500",
    },
    {
        label: "มาสาย",
        value: lateCount,
        icon: "i-lucide-alarm-clock",
        trend: "+1",
        trendIcon: "i-lucide-trending-up",
        trendColor: "text-amber-500",
        textColor: "text-amber-600 dark:text-amber-400",
        borderColor: "border-amber-500",
        iconBg: "bg-amber-50 dark:bg-amber-900/30",
        iconColor: "text-amber-500",
    },
]

// ── Department Breakdown ──
const departments = [
    { name: "ฝ่ายผลิต", count: 52, percentage: 33, color: "text-blue-600", badgeColor: "info" as const, barColor: "bg-blue-500" },
    { name: "ฝ่ายบัญชี/การเงิน", count: 28, percentage: 18, color: "text-emerald-600", badgeColor: "success" as const, barColor: "bg-emerald-500" },
    { name: "ฝ่ายขาย/การตลาด", count: 24, percentage: 15, color: "text-violet-600", badgeColor: "neutral" as const, barColor: "bg-violet-500" },
    { name: "ฝ่ายบุคคล (HR)", count: 18, percentage: 12, color: "text-pink-600", badgeColor: "error" as const, barColor: "bg-pink-500" },
    { name: "ฝ่ายไอที", count: 16, percentage: 10, color: "text-cyan-600", badgeColor: "info" as const, barColor: "bg-cyan-500" },
    { name: "ฝ่ายธุรการ", count: 10, percentage: 7, color: "text-amber-600", badgeColor: "warning" as const, barColor: "bg-amber-500" },
    { name: "ฝ่ายจัดซื้อ", count: 8, percentage: 5, color: "text-orange-600", badgeColor: "warning" as const, barColor: "bg-orange-500" },
]

// ── Today Attendance Table ──
const attendanceData = [
    { empCode: 1001, name: "สมชาย ใจดี", dept: "ฝ่ายผลิต", timeIn: "07:55", timeOut: "—", status: "ปกติ" },
    { empCode: 1002, name: "สมหญิง รักงาน", dept: "ฝ่ายบัญชี", timeIn: "08:02", timeOut: "—", status: "ปกติ" },
    { empCode: 1003, name: "ประเสริฐ มั่นคง", dept: "ฝ่ายไอที", timeIn: "08:45", timeOut: "—", status: "สาย" },
    { empCode: 1004, name: "วิภา สุขสันต์", dept: "ฝ่ายขาย", timeIn: "07:50", timeOut: "—", status: "ปกติ" },
    { empCode: 1005, name: "อนุชา พัฒนา", dept: "ฝ่ายผลิต", timeIn: "—", timeOut: "—", status: "ลาป่วย" },
    { empCode: 1006, name: "พิมพ์ใจ ศรีสุข", dept: "ฝ่ายบุคคล", timeIn: "08:00", timeOut: "—", status: "ปกติ" },
    { empCode: 1007, name: "ธนา วงศ์ทอง", dept: "ฝ่ายจัดซื้อ", timeIn: "09:10", timeOut: "—", status: "สาย" },
    { empCode: 1008, name: "กานดา แก้วมณี", dept: "ฝ่ายธุรการ", timeIn: "—", timeOut: "—", status: "ลากิจ" },
]

const attendanceColumns = [
    { accessorKey: "empCode", header: "รหัส", class: "w-16" },
    { accessorKey: "name", header: "ชื่อ-นามสกุล", class: "w-40" },
    { accessorKey: "dept", header: "แผนก", class: "w-28" },
    { accessorKey: "timeIn", header: "เข้างาน", class: "w-20" },
    { accessorKey: "timeOut", header: "ออกงาน", class: "w-20" },
    { accessorKey: "status", header: "สถานะ", class: "w-24" },
]

// ── Leave Requests ──
const leaveRequests = [
    {
        id: 1,
        name: "อนุชา พัฒนา",
        initials: "อพ",
        type: "ลาป่วย",
        dates: "30 พ.ค. 68",
        status: "รออนุมัติ",
        statusColor: "warning" as const,
        avatarClass: "bg-amber-100 text-amber-700",
    },
    {
        id: 2,
        name: "กานดา แก้วมณี",
        initials: "กม",
        type: "ลากิจ",
        dates: "30-31 พ.ค. 68",
        status: "รออนุมัติ",
        statusColor: "warning" as const,
        avatarClass: "bg-pink-100 text-pink-700",
    },
    {
        id: 3,
        name: "สมศักดิ์ ดีงาม",
        initials: "สด",
        type: "ลาพักร้อน",
        dates: "2-4 มิ.ย. 68",
        status: "อนุมัติ",
        statusColor: "success" as const,
        avatarClass: "bg-emerald-100 text-emerald-700",
    },
    {
        id: 4,
        name: "นภา จันทร์เพ็ญ",
        initials: "นจ",
        type: "ลาป่วย",
        dates: "28 พ.ค. 68",
        status: "อนุมัติ",
        statusColor: "success" as const,
        avatarClass: "bg-blue-100 text-blue-700",
    },
]

// ── Upcoming Events ──
const upcomingEvents = [
    {
        id: 1,
        month: "มิ.ย.",
        day: "3",
        title: "วันวิสาขบูชา",
        description: "วันหยุดราชการ",
        dateBg: "bg-red-50 dark:bg-red-900/20",
        dateColor: "text-red-600 dark:text-red-400",
    },
    {
        id: 2,
        month: "มิ.ย.",
        day: "5",
        title: "ประมวลผลเงินเดือน",
        description: "งวดเดือนพฤษภาคม 2568",
        dateBg: "bg-blue-50 dark:bg-blue-900/20",
        dateColor: "text-blue-600 dark:text-blue-400",
    },
    {
        id: 3,
        month: "มิ.ย.",
        day: "15",
        title: "ประเมินผลงาน Q2",
        description: "ครึ่งปีแรก 2568",
        dateBg: "bg-violet-50 dark:bg-violet-900/20",
        dateColor: "text-violet-600 dark:text-violet-400",
    },
    {
        id: 4,
        month: "ก.ค.",
        day: "28",
        title: "วันเฉลิมพระชนมพรรษา",
        description: "วันหยุดราชการ",
        dateBg: "bg-amber-50 dark:bg-amber-900/20",
        dateColor: "text-amber-600 dark:text-amber-400",
    },
]

// ── Quick Actions ──
const quickActions = [
    { label: "พนักงาน", icon: "i-lucide-id-card", to: "/employee", color: "primary" as const },
    { label: "เวลาเข้า/ออก", icon: "i-lucide-clock", to: "/timeinout", color: "success" as const },
    { label: "วันหยุด", icon: "i-lucide-calendar-x", to: "/holiday", color: "error" as const },
    { label: "เงินเดือน", icon: "i-lucide-wallet", to: "/calculate", color: "warning" as const },
    { label: "ผู้ใช้งาน", icon: "i-lucide-users", to: "/user", color: "info" as const },
    { label: "สิทธิเมนู", icon: "i-lucide-blinds", to: "/permission", color: "neutral" as const },
]
</script>
