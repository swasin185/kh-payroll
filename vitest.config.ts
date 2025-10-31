import { defineConfig } from "vitest/config"

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        reporters: ["verbose"],
        silent: false,
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
                    name: "nitro",
                    include: ["test/nitro/*.{test,spec}.ts"],
                    environment: "node",
                    setupFiles: ["./test/nitro/setupServer.ts"],
                },
            },
        ],
    },
})
