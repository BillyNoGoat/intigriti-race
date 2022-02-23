import passport from 'passport'
import Strategy from 'passport-local'
import {
    createNewUser,
    getUser
} from './dbHelper.js'

const strategy = new Strategy();

const customFields = {
    usernameField: 'uname',
    passwordField: 'pw'
}

const verifyCallback = (username, password, done) => {

}

// passport.use(new Strategy(function verify() {
//     if (!req.body || !req.body.name) return "Must provide a name.";
//     if (!/[A-z]{1,12}/.test(req.body.name)) return "Name must match Regex: /[A-z]{1,12}/";
//     const user = await createNewUser(req.body.name);
//     req.session.userID = user.id;
//     req.session.authenticated = true;
//     return res.status(200).send(`Your points have been reset to 0.`);
// }));