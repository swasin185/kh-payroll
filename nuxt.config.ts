const isDev = process.env.NODE_ENV !== "production"
const mockReportApi = "/api/kxreport"

export default defineNuxtConfig({
    ssr: false,
    compatibilityDate: "2025-07-15",
    devtools: { enabled: false },
    modules: ["@nuxt/ui", "nuxt-auth-utils", "@nuxt/test-utils"],
    css: ["@/assets/styles.css"],
    runtimeConfig: {
        public: {
            buildTime: Date.now(),
            // idle time limit for session disconnect
            idleLimit: process.env.MAX_AGE ? Number.parseInt(process.env.MAX_AGE) / 10 : 3600,
            // schedule time in seconds use for client make a schedule task
            schedule: 60,
        },
        session: {
            // max age for session nitro expired
            maxAge: process.env.MAX_AGE ? Number.parseInt(process.env.MAX_AGE) : 36000,
            password: process.env.NUXT_SESSION_PASSWORD ?? "1234567_1234567_1234567_12345678",
        },
    },
    nitro: {
        storage: {
            sessions: {
                driver: process.env.REDIS_URL ? "redis" : "memory",
                url: process.env.REDIS_URL ?? "",
            },
        },
    },
    routeRules: {
        "/kxreport/**": {
            // proxy to report server https://192.168.1.12:8443/kxreport/**
            proxy: isDev
                ? process.env.KXREPORT ?? mockReportApi
                : process.env.KXREPORT_HTTPS ?? mockReportApi,
        },
    },
})