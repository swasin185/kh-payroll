export default defineAppConfig({
    ui: {
        // colors: {
        //     primary: "blue",
        //     secondary: "purple",
        //     neutral: "zinc",
        // },
        button: {
            slots: { base: "cursor-pointer" },
        },
        table: {
            slots: {
                base: "bg-yellow-200 dark:bg-sky-500",
                tr: "bg-blue-200 dark:bg-gray-800",
                td: "m-1 p-1 cursor-pointer",
                th: "p-0",
            },
        },
        input: {
            slots: {
                root: "w-full",
            },
        },
    },
})