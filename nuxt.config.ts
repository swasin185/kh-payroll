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
        },
        session: {
            maxAge: 60 * 5, // 5 minutes
            password: process.env.NUXT_SESSION_PASSWORD || "1234567_1234567_1234567_12345678",
        },
    },
    nitro: {
        storage: {
            data: {
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