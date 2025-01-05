import fastify, { FastifyRegisterOptions } from "fastify"
import { data, User } from "./data.ts"
import { search, addUser, removeUser, editUser } from "./utils.ts"
import fastifySwaggerUi from "@fastify/swagger-ui"
import fastifySwagger, { SwaggerOptions } from "@fastify/swagger"
import { webTokens, TokenPayload } from "./tokens.ts"

const enableLogging = true
const serverDomain = "192.168.100.4"
const port = 3000

interface IQueryString {
    user: string
}

interface RequestVerified {
    verified: TokenPayload
}

interface UserID {
    userid: number
}

interface RefreshToken {
    token: string
}
console.log("registered interfaces")
const app = fastify({ logger: enableLogging })

let fastifySwaggerUiOptions = {
    routePrefix: '/docs',
    exposeRoute: true
}

let fastifySwaggerOptions: FastifyRegisterOptions<SwaggerOptions> = {
    openapi: {
        info: {
            title: "Address book API",
            description: "Test API for address book",
            version: "0.0.1",
        },
        components: { 
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer'
                }
            },
        },
        servers: [
            {
                url: `http://${serverDomain}:${port}/`
            },
            {
                url: "http://localhost:3000/"
            }
        ]
    }
}

const bearer = [{
    bearerAuth: []
}]

await app.register(fastifySwagger, fastifySwaggerOptions)

await app.register(fastifySwaggerUi, fastifySwaggerUiOptions)

async function auth(request, reply) {
    let token = request.headers.authorization?.replace("Bearer ", "")
    if (token && webTokens.verifyToken(token, "access") != undefined) {
        let decryptedToken = await webTokens.decryptToken(token)
        request.token = decryptedToken
    } else {
        reply.code(400).send({ error: "invalid token or no token was provided" })
    }
}

app.get("/users/get", async function handler(request, reply) {
    return data.value
})

app.route<{Querystring: IQueryString}>({
    method: "GET",
    url: "/users/search",
    schema: {
        tags: ["default"],
        description: "Searches users in database by name",
        querystring: {
            type: "object",
            properties: {
                user: {type: "string"},
            },
           required: ["user"]
        },
        response: {
            "200": {
                type: "object"
            }
        }
    },
    handler: async(request, reply) => {
        return JSON.stringify(search(request.query.user))
    }
})

app.route<{Body: User}>({
    method: "POST",
    url: "/user/",
    schema: {
        tags: ["default"],
        description: "Adds a new user",
        security: bearer,
        //body: {
        //    type: "object",
        //    properties: {
        //        success: { type: "boolean" }
        //    }
        //},
        body: {
            type: "object",
            properties: {
                name: { type: "string" },
                email: { type: "string"}
            },
            required: ["name", "email"]
        },
    },
    preHandler: [auth],
    handler: async(request, reply) => {
        let id = addUser(request.body.name, request.body.email)
        return JSON.stringify({ success: !!id, id: id })
    }
})

app.route({
    method: "POST",
    url: "/users/save",
    schema: {
        tags: ["default"],
        description: "Saves user to database file",
        security: bearer
    },
    preHandler: [auth],
    handler: async(request, reply) => {
        return JSON.stringify({ success: await data.saveData() })
    }
})
app.route<{Request: RequestVerified, Params:UserID}>({
    method: "DELETE",
    url: "/user/:userid",
    schema: {
        tags: ["default"],
        description: "Removes user by id",
        security: bearer,
        params: {
            type: "object",
            properties: {
                userid: { type: "number" }
            },
            required: ["userid"]
        },
    },
    preHandler: [auth],
    handler: async(request, reply) => {
        return JSON.stringify({ success: removeUser(request.params.userid)})
    }
})

app.route<{Params:UserID, Body:User}>({
    url: "/user/:userid",
    method: "PUT",
    schema: {
        description: "Edits user with provided name and email",
        security: bearer,
        tags: ["default"],
        params: {
            type: "object",
            properties: {
                userid: { type: "number" }
            },
            required: ["userid"]
        },
        body: {
            type: "object",
            properties: {
                name: { type: "string" },
                email: { type: "string" }
            },
        }
    },
    preHandler: [auth],
    handler: async(request, reply) => {
        console.log(`${request.body.name}, ${request.body.email} for ${request.params.userid}`)
        return { success: editUser(request.params.userid, request.body.name, request.body.email)}
    }
})

app.route<{Body: RefreshToken}>({
    url: "/generate",
    method: "POST",
    schema: {
        tags: ["tokens"],
        description: "Generates a new access token from refresh token",
        body: {
            type: "object",
            properties: {
                token: { type: "string" }
            }
        }
    },
    handler: async(request, reply) => {
        let token = request.body.token
        if (token && webTokens.verifyToken(token, "refresh") != undefined) {
            reply.code(200).send({ token: await webTokens.createToken("access", token), type: "access" })
        } else {
            reply.code(400).send({ error: "invalid token or no token was provided" })
        }
    }
})

try {
    await app.listen({port: port, host: "0.0.0.0"})
} catch (error) {
    app.log.error(error)
}
