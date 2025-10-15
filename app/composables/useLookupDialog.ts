export default function useLookupDialog(code:string, key: string): Promise<string | null> {
    return new Promise((resolve) => {
        // 1. Define the handler for when the modal closes
        const onClose = (selectedId: string | null) => {
           // modal.close()
            resolve(selectedId)
        }
        // 2. Open the modal using the dedicated component
        // modal.open(defineAsyncComponent(() => import('../components/MainMenu.vue')), {
        //     // Props passed to the UserLookupModal component
        //     initialSearchKey: key,
            
        //     // Event listener that the modal component calls on selection/cancellation
        //     onSelect: onClose,

        //     // Force the modal to be large and handle its own closing logic
        //     ui: { width: 'max-w-4xl' },
        // })

    })
}