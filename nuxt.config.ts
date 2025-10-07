// https://nuxt.com/docs/api/configuration/nuxt-config
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
            idleLimit: process.env.MAX_AGE ? Number.parseInt(process.env.MAX_AGE) / 10 : 3_600,
            // schedule time in seconds use for client & server make a schedule task
            schedule: 60 
        },
        session: {
            // max age for session nitro expired
            maxAge: process.env.MAX_AGE ? Number.parseInt(process.env.MAX_AGE) : 36_000, 
            password: process.env.NUXT_SESSION_PASSWORD || "1234567_1234567_1234567_12345678",
        },
    },
    nitro: {
        storage: {
            sessions: {
                driver: "memory",
            },
        },
    },
    // app: {
    //     head: {
    //         titleTemplate: "%s - PAYROLL",
    //         meta: [
    //             { charset: "utf-8" },
    //             {
    //                 name: "viewport",
    //                 content: "width=device-width, initial-scale=1",
    //             },
    //         ],
    //     },
    // },
})
