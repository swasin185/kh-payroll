// import { Users } from "../database/Users"
import { scheduleCleanSession } from "../utils/session"
export default defineNitroPlugin((nitroApp) => {
    console.log("Server initialized at startup")
    Date.prototype.toJSON = function () {
        return this.getHours() == 7
            ? this.toLocaleDateString("sv-SE")
            : this.toLocaleString("sv-SE")
    }
    scheduleCleanSession()
})
