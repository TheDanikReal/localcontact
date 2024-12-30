import { data, User } from "./data"
import { emailExists, emailValid, userExists } from "./validators"

function search(query: string): User[] {
    let result: User[] = []
    query = query.toLowerCase()
    for (let user of data.value) {
        if (user.name.toLowerCase().startsWith(query)) {
            result.push(user)
        }
    }
    return result
}

function addUser(name: string, email: string) {
    if (!emailExists(email) && !userExists(name) && emailValid(email)) {
        let userId = data.id
        let user: User = {name: name, email: email, id: userId}
        data.id++
        data.value.push(user)
        return userId
    } else {
        return -1
    }
}

function removeUser(userId: number) {
    try {
       // console.log(userId)
        // console.log(data.value.findIndex((user) => user.id == userId))
        data.value.splice(data.value.findIndex((user) => user.id === userId), 1)
        return true
    } catch (err) {
        return false
    }
}

function editUser(userId: number, name = "", email = ""): boolean {
    let index = data.value.findIndex((user) => user.id === userId)
    let dataChanged = false
    if (!name && !email || index == -1 || !emailValid(email)) {
        return false
    }
    if (name && !userExists(name)) {
        data.value[index].name = name
        dataChanged = true
    }
    if (email && !emailExists(email)) {
        data.value[index].email = email
        dataChanged = true
    }
    return dataChanged
}

export { search, addUser, removeUser, editUser }