const token = ""
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
    console.log(`${timeAfter}, ${timeBefore}`)
    console.log((Date.now() - timeBefore) / 1000 / 1000)
})
const deleteResponses = await Promise.all(idArr.map(async (num) => {await deleteUser(num)})).then((i) => {
    console.log(2000 / ((Date.now() - timeBefore) / 1000))
})
console.log(Date.now + " " + timeBefore)

export {}