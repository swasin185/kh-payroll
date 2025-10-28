import { defineConfig } from "vitest/config"

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        reporters: ["verbose"], 
        threads: false, 
        silent: false, 
        color: true, 
        
        projects: [
            {
                test: {
                    name: "test",
                    include: ["test/*.{test,spec}.ts"],
                    environment: "node",
                },
            },
            {
                test: {
                    name: "api",
                    include: ["test/api/*.{test,spec}.ts"],
                    environment: "node",
                    setupFiles: ["./test/setupServer.ts"],
                },
            },
        ],
    },
})
