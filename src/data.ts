import { promises as fs } from "fs"
import { serialize, deserialize } from "v8";

export interface User {
    name: string
    email: string
    id: number
}

export interface Data {
    currentid: number
    users: User[]
}

/**
 * Main class for ContactDB and id manager
 */
export class Database {
    private users: User[] = []
    private data: Data = {currentid: 0, users: this.users}
    bookfile: string = ""
    /**
     * @param bookfile Database file, defaults to addresses.data
     */
    constructor(bookfile="addresses.data") {
        this.bookfile = bookfile
    }
    
    /**
     * Get database entries and save to ram
     */
    public async initialize() {
        if (JSON.stringify(this.data) === `{"currentid":0,"users":[]}`) {
            try {
                let buffer = await fs.readFile(this.bookfile)
                let deserializedData: Data = deserialize(buffer)
                this.data = deserializedData
                this.users = deserializedData.users
            } catch (err) {}
        }
        console.debug(this.data)
    }
    public get value(): User[] {
        return this.users
    }
    public set value(val: User[]) {
        this.users = val;
    }
    public get id(): number {
        return this.data.currentid
    }
    public set id(id) {
        this.data.currentid = id
    }
    public async saveData(): Promise<boolean> {
        console.log(this.data)
        console.log("saving")
        try {
            await fs.writeFile(this.bookfile, serialize(this.data))
            return true
        } catch (err) {}
        return false
    }
}

console.log("creating database")
export const data = new Database()
await data.initialize()