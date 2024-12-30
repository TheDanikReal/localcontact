import select, { Separator } from "@inquirer/select";
import input from "@inquirer/input"
import search from "@inquirer/search"
import {userExists, emailExists, emailValid} from "./validators.ts"
import { User, data } from "./data.ts";

let bookfile = data.bookfile

console.table(data.value)

async function menu() {
    const answer = await select({
        message: 'Select an action',
        choices: [
          {
            name: 'Add a user',
            value: 'add',
            description: 'Add a user to your address book',
          },
          {
            name: 'Print all users',
            value: 'print',
            description: 'Print information about all users from database'
          },
          {
            name: 'edit',
            value: 'edit',
            description: 'Edit a user from your address book by their email or name',
          },
          {
            name: 'remove',
            value: 'remove',
            description: 'Remove a user from your address book by their name or email',
          },
          {
            name: 'search',
            value: 'search',
            description: 'Find a user from your address book and get information'
          },
          {
            name: 'exit',
            value: 'exit',
            description: 'Save data and exit'
          }
        ],
      });
    switch (answer) {
        case 'add':
            addmenu()
            break;
        case 'print':
            printusers()
            break;
        case 'edit':
            editmenu()
            break;
        case 'remove':
            removemenu()
            break
        case 'search':
            searchmenu()
            break
        case 'exit':
            exit()
            break
    }
}

async function addmenu() {
    let name = await input({message: "Enter name:"})
    let email = await input({message: "Enter email:"})
    if (userExists(name) || emailExists(email)) {
        console.error("Name or email provided is already associated with other user in database")
        return
    } else if (!emailValid(email)) {
        console.error("Invalid email")
        return
    }
    let choice = await select({
        message: "Select an action",
        choices: [{
            name: "save",
            value: "save",
            description: "Save data and quit to main menu"
        },
        {
            name: "cancel",
            value: "cancel",
            description: "Quit to main menu without saving"
        }]
    })
    if (choice == "save") {
        let user: User = {name: name, email: email, id: data.id}
        data.id++
        data.value.push(user)
    }
    menu()
}

async function editmenu() {
    let user = await searchPrompt()
    let item = await select({
      message: "Select information to edit",
      choices: [{
        name: "name",
        value: "name",
        description: `Edit name for ${data.value[user].name}`  
    },
    {
        name: "email",
        value: "email",
        description: `Edit email for user ${data.value[user].email}`
    }]  
    })
    let value = await input({
        message: `Enter new ${item} for ${data.value[user].name}`
    })
    switch (item) {
        case "name":
            if (userExists(value)) {
                console.error(`User ${value} already exists in database`)
            } else {
                data.value[user]["name"] = value
            }
            break;
        case "email":
            if (emailExists(value) || !emailValid(value)) {
                console.error(`User with email ${value} already exists in database or invalid email`)
            } else {
                data.value[user]["email"] = value
            }
    }
    // modifiedData = true
    menu()
}

async function searchmenu() {
    let user: number = await searchPrompt()
    console.log(`${data.value[user].name}, ${data.value[user].email}`)
    menu()
}

async function removemenu() {
    const user = await searchPrompt()
    let choice = await select({
        message: `Confirm action`,
        choices: [{
            name: "remove",
            value: "remove",
            description: `Remove user with name ${data.value[user].name} and email ${data.value[user].email}`
        }, {
            name: "cancel",
            value: "cancel",
            description: "Cancel removing user and return to main menu"
        }]
    })
    if (choice == "remove") {
        data.value.splice(user, 1)
    }
    menu()
}

async function searchPrompt(): Promise<number> {
    const name = await search({
        message: "Select name",
        source: async(input) => {
            if (!input) {
                input = ""
            }
            const searchData = searchItem(input)
            return searchData.map((user) => ({
                name: data.value[user].name,
                value: user,
                description: data.value[user].email
            }))
        },
    })
    return name
}

function searchItem(query: string): number[] {
    let arr: number[] = []
    let showAll = query == ""
    query = query.toLowerCase()
    for (let item in data.value) {
        if (data.value[item].name.toLowerCase().startsWith(query) || data.value[item].email.toLowerCase().startsWith(query) || showAll) {
            arr.push(Number(item))
        }
    }
    return arr
}

function printusers() {
    console.table(data.value)
    menu()
}

async function exit() {
    await data.saveData()
}

menu()