import { match } from "assert";
import { data } from "./data"

function userExists(name: string) {
    let exists = false
    for (let user of data.value) {
        if (user["name"] == name) {
            exists = true
            break
        }
    }
    return exists
}

function emailValid(email: string): boolean {
    let emailRegex = /([A-Za-z0-9]+[.-_])*[A-Za-z0-9]+@[A-Za-z0-9-]+(\.[A-Z|a-z]{2,})+$/g
    try {
        match(email, emailRegex)
        return true
    } catch (error) {
        return false
    }
}

function emailExists(email: string): boolean {
    let exists = false
    for (let key in data.value) {
        if(data.value[key]["email"] == email) {
            exists = true
            break
        }
    }
    return exists
}

export {userExists, emailValid, emailExists}