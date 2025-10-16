interface ConfirmOptions {
    title?: string
    message?: string
    isConfirm?: boolean
    lookupName?: string
    lookupCode?: string
}

const state = reactive({
    show: false,
    title: "Confirm",
    message: "Are you sure?",
    isConfirm: false,
    lookupName: "",
    lookupCode: "",
})

let resolver: ((value: string) => void) | null = null

export function useDialogState() {
    return {
        state,
        resolve: (result: string) => {
            state.show = false
            resolver?.(result)
            resolver = null
        },
    }
}

export function useDialog() {
    return (options?: ConfirmOptions) => {
        state.title = options?.title ?? options?.lookupName ?? ""
        state.message = options?.message ?? " "
        state.show = true
        state.isConfirm = options?.isConfirm ?? false
        state.lookupName = options?.lookupName ?? ""
        state.lookupCode = options?.lookupCode ?? ""
        return new Promise<string>((resolve) => {
            resolver = resolve
        })
    }
}
