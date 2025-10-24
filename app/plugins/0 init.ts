export default defineNuxtPlugin(async (nuxtApp) => {
    console.log("App initialized at startup")

    // make every pages keep alive while navigate push/back
    nuxtApp.hook('page:extend', (page) => {
        page.meta.keepalive ??= true
    })
})
