import { ofetch } from "ofetch"

export default defineNuxtPlugin((nuxtApp) => {
    const isWaiting = useWaiting()
    const customFetch = ofetch.create({
        onRequest() {
            isWaiting.value = true
        },
        onResponse() {
            isWaiting.value = false
        },
        onResponseError(event) {
            isWaiting.value = false
            showError(event.response!)
        },
        onRequestError(event) {
            isWaiting.value = false
            showError(event.error)
        },
    })
    nuxtApp.provide("waitFetch", customFetch)
})
