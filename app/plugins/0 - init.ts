export default defineNuxtPlugin(async (nuxtApp) => {
    console.log("App initialized at startup")

    Date.prototype.toString = function () {
        return this.getHours() == 7
            ? this.toLocaleDateString("sv-SE")
            : this.toLocaleString("sv-SE")
    }
})
