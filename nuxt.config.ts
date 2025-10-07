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
                driver: "memory"
            },
            redis: {
                driver: "redis",
                port: process.env.REDIS_PORT,
                host: process.env.REDIS_HOST,
                username: process.env.REDIS_USER || "default",
                password: process.env.REDIS_PASSWORD,
                db: 0,
            },
   					     vercel: {
                driver: "vercel-kv",
                // these are automatically available when deployed on Vercel
                url: process.env.KV_REST_API_URL,
                token: process.env.KV_REST_API_TOKEN
            },
        },
    },
})
