// import { Users } from "../database/Users"
export default defineNitroPlugin((nitroApp) => {
    console.log("Server initialized at startup")
    Date.prototype.toJSON = function () {
        return this.getHours() == 7
            ? this.toLocaleDateString("sv-SE")
            : this.toLocaleString("sv-SE")
    }
})
