const token = "eyJhbGciOiJIUzI1NiJ9.eyJ0eXBlIjoicmVmcmVzaCIsInJhbmRvbSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6WzE1NywyMDgsMTI4LDIzMSw0NSwyMjksMjMyLDE1LDg5LDIyLDE0NSw2NiwxMTEsMTU4LDMyLDI0LDEzMiwyNDAsMjgsMTU5LDExMiw0LDExNCwxNDEsNjMsNzUsNjcsMTU4LDE0Myw2NywxMjIsMTU5XX19.R6TYapzHkEHj9PrI1MlOP-dNqRiAcNJ6afbtWIcMOc8"
const domain = "localhost"
const port = 3000
const baseUrl = `http://${domain}:${port}`

async function createUser(name: string, email: string) {
    let bodyData = JSON.stringify({name: name, email: email})
    const response = await fetch(`${baseUrl}/user/`, {
        method: "POST",
        headers: {
            "Content-type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: bodyData
    })
    let json = await response.json()
    idArr.push(json.id)
    return json
}

async function deleteUser(id: number) {
    let response = {}
    try {response = await fetch(`${baseUrl}/user/` + id, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + token
        }
    })} catch (err) {
        response = {}
    }
    return 0
}

let arr: number[] = []
let idArr: number[] = []

for (let i = 20; i <= 1000; i++) {
    arr.push(i)
}
let timeBefore = Date.now()
let timeAfter = 0
console.log(timeBefore)
const responses = await Promise.all(arr.map(async (num) => {await createUser(`test${num}`, `test${num}@example.com`)})).then((i) => {
    timeAfter = Date.now()
    console.log((Date.now() - timeBefore) / 1000 / 1000)
})
console.log(`${idArr.length} users were created`)
const deleteResponses = await Promise.all(idArr.map(async (num) => {await deleteUser(num)})).then((i) => {
    console.log(2000 / ((Date.now() - timeAfter) / 1000) + " RPS")
})
console.log(Date.now + " " + timeBefore)

export {}
