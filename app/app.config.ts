export default defineAppConfig({
    ui: {
        modal: {
            slots: {
                body: "",
            },
        },
        colors: {
            primary: "blue",
            secondary: "purple",
            neutral: "zinc",
        },
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
        input: {
            slots: {
                root: "w-full",
            },
        },
    },
})
