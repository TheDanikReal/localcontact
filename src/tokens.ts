import { SignJWT, jwtVerify } from "jose"
import { randomBytes } from "crypto"
import { deserialize, serialize } from "v8"
import { promises as fs } from "fs"

interface Token {
    token: string
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
    public async createToken(tokenType: string): Promise<string> {
        if (tokenType != "refresh" && tokenType != "access") {}
        let randomData = randomBytes(32)
        let encryptedToken = await new SignJWT({type: tokenType, random: randomData})
        .setExpirationTime("5hrs")
        .setProtectedHeader({alg: this.data.alghoritm})
        .sign(this.data.secret)
        this.data.tokens.push({ token: encryptedToken })
        return encryptedToken
    }
    public async decryptToken(token: string): Promise<DecryptedToken | boolean> {
        let decryptedToken: boolean | DecryptedToken
        try {
            decryptedToken = await jwtVerify(token, this.data.secret)
        } catch (err) {
            decryptedToken = false
        }
        return decryptedToken
    }
    public async verifyToken(token: string): Promise<Token | undefined> {
        let cacheToken = this.cache.get(token)
        if (cacheToken) {
            if (cacheToken.validity == true) {
                return cacheToken.data
            }
        }
        if (await this.decryptToken(token) != false) {
            let tokenData = this.data.tokens.find((tokenStore) => tokenStore.token === token)
            this.cache.set(token, { validity: true, data: tokenData })
            setTimeout(() => {
                this.cache.set(token, false)
            }, 100000);
            return tokenData
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
console.log(webTokens.data.tokens)