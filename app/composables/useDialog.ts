interface ConfirmOptions {
    title?: string
    message?: string
    isConfirm?: boolean
    lookupName?: string
    lookupCode?: string | null
    isPrompt?: boolean
}

const state = reactive({
    show: false,
    title: "Confirm",
    message: "Are you sure?",
    lookupName: "",
    lookupCode: "",
    isPrompt: false,
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

export default function useDialog() {
    return (options?: ConfirmOptions) => {
        state.show = true
        state.title = options?.title ?? options?.lookupName ?? " "
        state.message = options?.message ?? " "
        state.lookupName = options?.lookupName ?? ""
        state.lookupCode = options?.lookupCode ?? ""
        state.isPrompt = options?.isPrompt ?? false
        return new Promise<string>((resolve) => (resolver = resolve))
    }
}
