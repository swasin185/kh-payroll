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
                    name: "default",
                    include: ["test/*.{test,spec}.ts"],
                    environment: "node",
                },
            }
        ],
    },
})
