import { SignJWT, jwtVerify } from "jose"
import { randomBytes } from "crypto"
import { deserialize, serialize } from "v8"
import { promises as fs } from "fs"

interface Token {
    token?: string,
    refresh?: string
}
interface TokenStore {
    secret: Uint8Array
    alghoritm: string
    tokens: Token[]
}

interface DecryptedToken {
    payload: TokenPayload
    protectedHeader: object

}

export interface TokenPayload {
    type: string
    random: Uint8Array
    exp: number
}

class WebTokens {
    data: TokenStore
    tokenfile: string
    cache: Map<any, any> = new Map()

    constructor(tokenfile: string) {
        this.tokenfile = tokenfile
    }
    public changeProperties(secret?: string, alghoritm?: string) {
        if (alghoritm) {
            this.data.alghoritm = alghoritm
        }
        if (secret) {
            this.data.secret = new TextEncoder().encode(secret)
        }
    }
    public async createToken(tokenType: string, refreshToken?: string): Promise<string | undefined> {
        const invalidType = tokenType != "refresh" && tokenType != "access"
        const unadoptedAccessToken = tokenType == "access" && !refreshToken
        if (invalidType || unadoptedAccessToken) {
            return undefined
        }
        let tokenLocation = ""
        let ttl = ""
        switch (tokenType) {
            case "access":
                ttl = "6hrs"
                break;
        
            case "refresh":
                ttl = "2w"
                break;
        }
        let randomData = randomBytes(32)
        let encryptedToken = await new SignJWT({type: tokenType, random: randomData})
        .setExpirationTime(ttl)
        .setProtectedHeader({alg: this.data.alghoritm})
        .sign(this.data.secret)
        if (tokenType == "access") {
            let refreshIndex = this.data.tokens.findIndex((token) => token.refresh == refreshToken)
            console.log(refreshIndex)
            console.log(this.data.tokens[refreshIndex])
            this.data.tokens[refreshIndex].token = encryptedToken
            console.log(tokenLocation)
        } else {
            this.data.tokens.push({ refresh: encryptedToken })
            console.log(this.data.tokens)
        }
        return encryptedToken
    }
    public async decryptToken(token: string): Promise<DecryptedToken | false> {
        let decryptedToken: boolean | DecryptedToken
        try {
            decryptedToken = await jwtVerify(token, this.data.secret)
        } catch (err) {
            decryptedToken = false
        }
        return decryptedToken
    }
    public async verifyToken(token: string, type: string): Promise<Token | undefined> {
        if (type == "access") {
            type = "token"
        }
        let cacheToken = this.cache.get(token)
        if (cacheToken) {
            if (cacheToken.validity == true) {
                return cacheToken.data
            }
        }
        const tokenData = await this.decryptToken(token)
        if (tokenData != false) {
            console.log(tokenData.payload.type)
            if (tokenData.payload.type != type) {
                return undefined
            }
            let tokenStoreData = this.data.tokens.find((tokenStore) => tokenStore[type] === token)
            console.log(tokenData)
            this.cache.set(token, { validity: true, data: tokenData })
            setTimeout(() => {
                this.cache.set(token, false)
            }, 100000);
            return tokenStoreData
        } else {
            return undefined
        }
    }
    public async initialize() {
        if (!!JSON.stringify(this.data) === false) {
            try {
                let buffer = await fs.readFile(this.tokenfile)
                let deserializedData: TokenStore = deserialize(buffer)
                this.data = deserializedData
            } catch (err) {}
        } else {
            console.log(this.data)
        }
    }
        
    public async saveData(): Promise<boolean> {
        console.log(this.data)
        console.log("saving")
        try {
            await fs.writeFile(this.tokenfile, serialize(this.data))
            return true
        } catch (err) {
            return false
        }
    }
}

export const webTokens = new WebTokens("tokens.data")
await webTokens.initialize()
console.log(await webTokens.verifyToken("eyJhbGciOiJIUzI1NiJ9.eyJ0eXBlIjoicmVmcmVzaCIsInJhbmRvbSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6WzE1NywyMDgsMTI4LDIzMSw0NSwyMjksMjMyLDE1LDg5LDIyLDE0NSw2NiwxMTEsMTU4LDMyLDI0LDEzMiwyNDAsMjgsMTU5LDExMiw0LDExNCwxNDEsNjMsNzUsNjcsMTU4LDE0Myw2NywxMjIsMTU5XX19.R6TYapzHkEHj9PrI1MlOP-dNqRiAcNJ6afbtWIcMOc8", "access"))
console.log(webTokens.data.tokens)
/* await webTokens.createToken("refresh")
console.log(await webTokens.createToken("access", "eyJhbGciOiJIUzI1NiJ9.eyJ0eXBlIjoicmVmcmVzaCIsInJhbmRvbSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6WzE0OSwxMTYsNzcsMTI0LDI0MSw5NywyNDgsMjM5LDI1MywxOTksMjgsMTM4LDE4NiwyMDAsMzAsMTUyLDU3LDEyMiw2OCwxMDMsMjI0LDI0NSwzNSwxMzMsNjQsMjQzLDEzOSwxMjYsMjE2LDY3LDI0Myw3NV19LCJleHAiOjE3MzcwNDM4MzZ9.ttsSwWMpbSUhI-zp4JkqpumSopOx1P3VSGNboBZRWmo"))
console.log(webTokens.data)
console.log(await webTokens.createToken("access", "eyJhbGciOiJIUzI1NiJ9.eyJ0eXBlIjoicmVmcmVzaCIsInJhbmRvbSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6WzE0OSwxMTYsNzcsMTI0LDI0MSw5NywyNDgsMjM5LDI1MywxOTksMjgsMTM4LDE4NiwyMDAsMzAsMTUyLDU3LDEyMiw2OCwxMDMsMjI0LDI0NSwzNSwxMzMsNjQsMjQzLDEzOSwxMjYsMjE2LDY3LDI0Myw3NV19LCJleHAiOjE3MzcwNDM4MzZ9.ttsSwWMpbSUhI-zp4JkqpumSopOx1P3VSGNboBZRWmo"))
console.log(webTokens.data)
*/