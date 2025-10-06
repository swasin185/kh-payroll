import { ofetch } from "ofetch"

export default defineNuxtPlugin((nuxtApp) => {
    const isWaiting = useWaiting()
    const toast = useToast()
    const customFetch = ofetch.create({
        onRequest() {
            if (isWaiting.value) {
                toast.add({
                    title: `[${new Date()}] Request Error`,
                    description: "กำลังรอเซิฟเวอร์ทำงาน",
                    color: "error",
                })
            }
            isWaiting.value = true
        },
        onResponse() {
            isWaiting.value = false
        },
        onResponseError() {
            isWaiting.value = false
        },
        onRequestError() {
            isWaiting.value = false
            showError({
                statusCode: 500,
                message: "Request Error!!",
            })
        },
    })

    nuxtApp.provide("waitFetch", customFetch)
})
