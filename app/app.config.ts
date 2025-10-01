export default defineAppConfig({
    ui: {
        colorMode: true,
        button: {
            slots: { base: "cursor-pointer" },
        },
        table: {
            slots: {
                td: "m-1 p-1 cursor-pointer",
                th: "p-0",
            },
        },
        inputNumber: {
            slots: {
                base: "text-right",
            },
        },
    },
})
