import { ofetch } from "ofetch"

export default defineNuxtPlugin((nuxtApp) => {
    const isWaiting = useState("isWaiting", () => false)
    const activeRequests = ref(0)
    const clearWaiting = () => {
        activeRequests.value--
        if (activeRequests.value <= 0) isWaiting.value = false
    }
    const customFetch = ofetch.create({
        onRequest() {
            activeRequests.value++
            isWaiting.value = true
        },
        onResponse() {
            clearWaiting()
        },
        onResponseError() {
            clearWaiting()
        },
        onRequestError() {
            clearWaiting()
            showError({
                statusCode: 500,
                message: "Request Error!!"
            })
        },
    })

    nuxtApp.provide("waitFetch", customFetch)
})
