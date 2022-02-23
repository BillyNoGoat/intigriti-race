import {
    join,
    dirname
} from 'path'
import {
    Low,
    JSONFile
} from 'lowdb'
import {
    fileURLToPath
} from 'url'

const __dirname = dirname(fileURLToPath(
    import.meta.url));

// Use JSON file for storage
const file = join(__dirname, 'db.json')
const adapter = new JSONFile(file)
const db = new Low(adapter)

// Read data from JSON file, this will set db.data content
await db.read()

export function getPoints(userID) {
    const {
        users
    } = db.data
    const out = users.find((u) => u.id === userID);
    return out.points;
}

export function setScore(userID, score) {
    const {
        users
    } = db.data
    const out = users.find((u) => u.id === userID);
    out.points = score;
    db.write();
    return out;
}

export function getChallengeComplete(userID, challengeName) {
    const {
        users
    } = db.data
    const out = users.find((u) => u.id === userID);
    return out[challengeName];
}

export function setChallengeValue(userID, challengeName, value) {
    const {
        users
    } = db.data
    const out = users.find((u) => u.id === userID);
    out[challengeName] = value;
    db.write();
    return out;
}

// Called when we get a request without a session token linked to a user. 
// Creates a user with unique ID and attaches the ID to the session
export async function createNewUser(name) {
    const user = {
        "id": db.data.users.length + 1,
        "points": 0,
        "q1": false,
        "q2": false,
        "q3":false
    };
    db.data.users.push(user);
    await db.write()
    console.log("User created");
    return user;
}

export function getTotalUsers() {
    return db.data.users.length;
}

export function getUser(userID) {
    const {
        users
    } = db.data
    const out = users.find((u) => u.id === userID);
    return out;
}