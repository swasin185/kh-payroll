import { ofetch } from "ofetch"

export default defineNuxtPlugin((nuxtApp) => {
    const isWaiting = useState("isWaiting", () => false)
    const activeRequests = ref(0)

    const customFetch = ofetch.create({
        onRequest() {
            activeRequests.value++
            isWaiting.value = true
        },
        onResponse() {
            activeRequests.value--
            if (activeRequests.value <= 0) {
                isWaiting.value = false
            }
        },
        onResponseError() {
            activeRequests.value--
            if (activeRequests.value <= 0) {
                isWaiting.value = false
            }
            location.reload()
        },
    })

    nuxtApp.provide("waitFetch", customFetch)
})
