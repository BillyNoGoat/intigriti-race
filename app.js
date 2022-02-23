import express from 'express';
import {
    Low,
    JSONFile
} from 'lowdb';
import bodyParser from 'body-parser';
import {
    getPoints,
    setScore,
    getChallengeComplete,
    setChallengeValue,
    getTotalUsers,
    createNewUser,
    getUser
} from './dbHelper.js'
import cors from 'cors'
import session from 'express-session'
import LocalFileStore from 'session-file-store'


const FileStore = LocalFileStore(session);

const adapter = new JSONFile('userData.json');
const db = new Low(adapter);

await db.read();

const app = express();
const port = 3000;

const answers = [{
        questionNum: 1,
        answer: "monthly"
    },
    {
        questionNum: 2,
        answer: "10"
    },
    {
        questionNum: 3,
        answer: "24"
    },
];

app.use(cors())
app.use(bodyParser.json());
app.use(session({
    'secret': 'SOME SECRET',
    'cookie': {
        maxAge: 2147483647
    },
    saveUninitialized: true,
    resave: false,
    store: new FileStore({
        "ttl": 604800
    })
}));
app.use((err, req, res, next) => {
    if (err) {
        res.status(400).send('Parsing error.')
    } else {
        next()
    }
})

// Handle new or existing sessions
app.use(async (req, res, next) => {
    if ((!req.session.userID && req.path == "/login")) {
        console.log("Creating new")
        const user = await createNewUser();
        console.log("Creating new user " + req.session.userID);
        req.session.userID = user.id;
        console.log(req.session.userID);
        console.log(req.session);
        await req.session.save();
        next();
    } else {
        next();
    }
    
});

//Redirect all requests to welcome if not passed welcome page
app.use(async (req, res, next) => {
    // console.log(req.path);
    if(!req.session.userID && !(["/welcome", "/login", "/static/bc87e5124f8d2cfe810d403adc96ad01.gif"].includes(req.path))) {
        console.log('Unauthed user accessing ' + req.path + ' with id ' + req.session.userID);
        res.redirect('/welcome');
        // res.status(403).send('Sorry, you are not authorised make this action.\nPlease log-in first at <a href="/welcome">The welcome page</a>');
    } else {
        next();
    }
});




app.post('/submitAnswer', async (req, res) => {
    if (!req.body || !req.body.questionNumber || !req.body.answer) return res.send("Malformed or missing request body");
    const submittedAnswer = req.body.answer;

    const qa = answers.find((qa) => qa.questionNum == req.body.questionNumber);

    if (!qa) return res.send("Invalid question number! Only 1,2,3 accepted.");
    if (submittedAnswer != qa.answer) return res.send("Incorrect answer!");

    const result = await completeChallenge(`q${qa.questionNum}`, req.session.userID);

    return res.send(result);
});

// Called when a user hits enter
app.post('/login', async (req, res) => {
    return res.redirect('/');
});

app.post('/reset', async (req, res) => {
    await setScore(req.session.userID, 0);
    ["q1", "q2", "q3"].forEach(q => setChallengeValue(req.session.userID, q, false));
    return res.send(`Your points have been reset to 0.`);
});

app.get('/buyFlag', async (req, res) => {
    const points = await getPoints(req.session.userID);
    if (points >= 100) {
        return res.send(`Congratulations! Here is your flag: this_is_a_secret_flag`);
    } else {
        return res.send(`Not enough points to purchase!\nYou have ${points} points but you need 100`);
    }
});

app.get('/', async (req, res) => {
    res.sendFile('/Users/billy/Library/Mobile Documents/com~apple~CloudDocs/Projects/intigriti-race/index.html');
});

app.get('/welcome', async (req, res) => {
    res.sendFile('/Users/billy/Library/Mobile Documents/com~apple~CloudDocs/Projects/intigriti-race/welcome.html');
});

app.get('/user', async (req, res) => {
    const user = await getUser(req.session.userID);
    return res.send(user);
});

app.use('/static', express.static('static'))

app.listen(port, () => {
    console.log(`API running at: http://localhost:${port}`);
});

async function completeChallenge(challengeName, id) {
    const completed = await getChallengeComplete(id, challengeName);
    if (completed) return "You already redeemed this flag!";
    let points = await getPoints(id);
    await setScore(id, points + 10);
    points = await getPoints(id);

    setTimeout(async () => {
        await setChallengeValue(id, challengeName, true)
    }, 2);
    // await setChallengeValue(id, challengeName, true)
    return `Correct answer! +10 points!`;
}

// Add error handling
// Change server status codes to be exactly correct 
// Get current directory programatically