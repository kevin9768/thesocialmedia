import {Application, NextFunction, Request, Response} from 'express';
import { redis } from "../redis";
import md5 from 'md5';
import {ProfileModel} from './models/Profile.model';
import {UserModel} from './models/User.model';
import { PassportUser } from 'index';

// export type SessionUsers = {
//     [key : string]: string
// };

declare global {
    namespace Express {
        interface User extends PassportUser {}
    }
}

// export const sessionUser : SessionUsers = {};
export const cookieKey = "sid";

export const isLoggedIn = async (req : Request, res : Response, next : NextFunction) => {
    // likely didn't install cookie parser
    if (!req.cookies) {
        return res.sendStatus(401);
    }
    const sid = req.cookies[cookieKey];
    
    // no sid for cookie key
    if (!sid) {
        return res.sendStatus(401);
    }
    
    const username = await redis.get(sid);
    
    if (username) {
        next();
        // no username mapped to sid
        return;
    } else {
        return res.sendStatus(401)
    }
}

const loginGoogle = async(req : Request, res : Response) => {
    const user  = req.user;
    if(!user)
        res.sendStatus(404);
    else{

        let googleUser =  await UserModel.findOne({auth: user.id});
        if (!googleUser){
            await ProfileModel.create({username: user.email, email: user.email, dob: 0, zipcode: 55688});
            googleUser = await UserModel.create({username: user.email, auth: user.id, created: new Date()});
        }
        if (googleUser){
            const sid = md5(googleUser.username + new Date().getTime());
            redis.setex(sid, 3600, googleUser.username);
            res.cookie(cookieKey, sid, {
                maxAge: 3600 * 1000,
                httpOnly: true,
                sameSite: 'none',
                secure: true
            });
            const msg = {
                result: 'success',
                username: googleUser.username
            };
            res.send(msg);
        }
        else{
            
            res.sendStatus(404);
        }
    }
}


const login = async(req : Request, res : Response) => {
    const {username, password} = req.body;
    // supply username and password
    if (!username || !password) {
        return res.sendStatus(400);
    }

    const user = await UserModel.findOne({username});

    if (!user) {
        return res.sendStatus(401)
    }

    // create hash using md5, user salt and request password, check if hash matches
    // user hash
    const hash = md5(user.salt + password);

    if (hash === user.hash) {
        if (req.cookies[cookieKey])
            await redis.del(req.cookies[cookieKey]);
            // delete sessionUser[req.cookies[cookieKey]];

        // create session id, use sessionUser to map sid to user username
        const sid = md5(username + new Date().getTime()); // CHANGE THIS!
        redis.setex(sid, 3600, user.username);
        // sessionUser[sid] = user.username;
        // Adding cookie for session id
        res.cookie(cookieKey, sid, {
            maxAge: 3600 * 1000,
            httpOnly: true,
            sameSite: 'none',
            secure: true
        });
        const msg = {
            result: 'success',
            username
        };
        return res.send(msg);
    } else {
        return res.sendStatus(401);
    }
}

const register = async(req : Request, res : Response) => {
    const {username, email, dob, zipcode, password} = req.body;

    // supply username and password
    if (!username || !email || !dob || !zipcode || !password) {
        return res
            .status(400)
            .send("Missing fields");
    }

    let user = await UserModel.findOne({username});

    if (user) {
        return res
            .status(400)
            .send("User already exists");
    }
    const salt = username + new Date().getTime();
    const hash = md5(salt + password)

    user = new UserModel({username, salt, hash, created: new Date()});

    await user.save();
    await(new ProfileModel({username, email, dob, zipcode})).save();

    // create session id, use sessionUser to map sid to user username
    const sid = md5(username + new Date().getTime()); // CHANGE THIS!
    redis.setex(sid, 3600, user.username);
    // sessionUser[sid] = user.username;
    // Adding cookie for session id
    res.cookie(cookieKey, sid, {
        maxAge: 3600 * 1000,
        httpOnly: true,
        sameSite: 'none',
        secure: true
    });
    const msg = {
        username,
        result: 'success'
    };

    return res.send(msg);
}

const editPassword = async(req : Request, res : Response) => {
    const {password} = req.body;
    // const username = sessionUser[req.cookies[cookieKey]];
    const username = await redis.get(req.cookies[cookieKey]);

    if (!password) {
        return res
            .status(400)
            .send("Password should not be empty");
    }
    const user = await UserModel.findOne({username});

    if (!user) {
        return res.status(401);
    }
    await user.updateOne({
        hash: md5(user.salt + password)
    });

    return res.send({username: user.username, status: 'success'});
}

const logout = async (req : Request, res : Response) => {
    if (req.cookies[cookieKey])
        await redis.del(req.cookies[cookieKey]);
        // delete sessionUser[req.cookies[cookieKey]];
    req.session.destroy(()=>{});
    res.send('OK');
}

const me = async (req: Request, res: Response)=>{
    const username = await redis.get(req.cookies[cookieKey]);
    const user = await UserModel.findOne({username});
    if(!username){
        res.send({username: "", oauth: false, authEmail: user?.authEmail});
    } else {
        if(user && user.username.includes('@'))
            res.send({username, oauth: true, authEmail: user?.authEmail});
        else
            res.send({username, oauth: false, authEmail: user?.authEmail})
    }
}

export default(app : Application) => {
    app.get('/me', me);
    app.post('/login-google', loginGoogle);
    app.post('/login', login);
    app.post('/register', register);
    app.put('/logout', isLoggedIn, logout);
    app.put('/password', isLoggedIn, editPassword);
}
