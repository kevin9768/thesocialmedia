import {Application, Request, Response} from 'express';
import { redis } from "../redis";
import {cookieKey} from './auth';
import { CloudinaryRequest, uploadImage } from './middleware/uploadCloudinary';
import { ArticleModel } from './models/Article.model';
import {ProfileModel} from './models/Profile.model';
import { UserModel } from './models/User.model';


const linkGoogle = async (req: Request, res: Response) => {
    const sessionUser = req.user;
    const loggedInUsername = await redis.get(req.cookies[cookieKey]);
    if(!sessionUser || !loggedInUsername){
        res.sendStatus(401);
    }
    else {
        const googleUser = await UserModel.findOne({auth: sessionUser.id});
        const loggedInUser = await UserModel.findOne({
            username: loggedInUsername
        });
        if(!loggedInUser || (googleUser && (googleUser.auth === loggedInUser.auth))){
            res.sendStatus(401);
        }
        else{
            if(googleUser) {
                if(googleUser.username.includes('@')){
                    // link account
                    const googleProfile = await ProfileModel.findOne({username: sessionUser.email});
                    const userProfile = await ProfileModel.findOne({username: loggedInUsername});
                    if(!googleProfile || !userProfile)
                        res.sendStatus(404);
                    else{
                        await loggedInUser.updateOne({auth: sessionUser.id, authEmail: sessionUser.email});
                        await userProfile.updateOne({following:[...new Set([...userProfile.following, ...googleProfile.following].filter(follow => follow != loggedInUsername))]});
                        await googleProfile.deleteOne();
                        await googleUser.deleteOne();
                        await ArticleModel.updateMany({author: sessionUser.email}, {author: loggedInUsername});
                        await ArticleModel.updateMany({'comments.author': sessionUser.email}, {'$set': { 'comments.$.author': loggedInUsername}});
                        res.send({result: "success"});
                    }
                    
                }
                else
                    res.send({ result: "error",  error: "This account is linked with other users." })
            }
            else {
                await loggedInUser.updateOne({auth: sessionUser.id, authEmail: sessionUser.email});
                res.send({result: "success"});
            }
        }
    }
}

const unlinkGoogle = async (req: Request, res: Response) => {
    const loggedInUsername = await redis.get(req.cookies[cookieKey]);
    if(!loggedInUsername)
        res.sendStatus(401);
    else {
        const loggedInUser = await UserModel.findOne({username: loggedInUsername});
        if(loggedInUser){
            await loggedInUser.updateOne({auth: null, authEmail: null});
            req.session.destroy(()=>{});
            res.send({result: "success"});
        }
        else {
            res.sendStatus(404);
        }
    }
}


const getHeadline = async(req : Request, res : Response) => {
    const {username} = req.params;
    const loggedInUsername = await redis.get(req.cookies[cookieKey]);
    if (!username) {
        const loggedInUser = await ProfileModel.findOne({
            username: loggedInUsername
        });
        if (!loggedInUser) {
            res.sendStatus(401);
        } else {
            res.send({username: loggedInUser.username, headline: loggedInUser.headline});
        }
    } else {
        const profile = await ProfileModel.findOne({username});
        if (!profile)
            res.status(404).send("User does not exist");
        else
            res.send({username: profile.username, headline: profile.headline});
        }

}

const updateHeadline = async(req : Request, res : Response) => {
    const {headline} = req.body;
    if (!headline) {
        res
            .status(400)
            .send("Should send a headline");
    }
    const username = await redis.get(req.cookies[cookieKey]);
    let profile = await ProfileModel.findOne({username});
    if (!profile) {
        res.status(401);
    } else {
        await profile.updateOne({headline});
        profile = await ProfileModel.findOne({username});
        res.send({
            username: profile !.username,
            headline: profile !.headline
        });
    }
}

const getEmail = async(req : Request, res : Response) => {
    const {username} = req.params;
    const loggedInUsername = await redis.get(req.cookies[cookieKey]);
    if (!username) {
        const loggedInUser = await ProfileModel.findOne({
            username: loggedInUsername
        });
        if (!loggedInUser) {
            res.sendStatus(401);
        } else {
            res.send({username: loggedInUser.username, email: loggedInUser.email});
        }
    } else {
        const profile = await ProfileModel.findOne({username});
        if (!profile)
            res.status(404).send("User does not exist");
        else
            res.send({username: profile.username, email: profile.email});
        }
    }

const updateEmail = async(req : Request, res : Response) => {
    const {email} = req.body;
    if (!email) {
        res
            .status(400)
            .send("Should send an email");
    }
    const username = await redis.get(req.cookies[cookieKey]);
    let profile = await ProfileModel.findOne({username});
    if (!profile) {
        res.sendStatus(401);
    } else {
        await profile.update({email});
        profile = await ProfileModel.findOne({username})
        res.send({
            username: profile !.username,
            email: profile !.email
        });
    }
}

const getZipcode = async(req : Request, res : Response) => {
    const {username} = req.params;
    const loggedInUsername = await redis.get(req.cookies[cookieKey]);
    if (!username) {
        const loggedInUser = await ProfileModel.findOne({
            username: loggedInUsername
        });
        if (!loggedInUser) {
            res.sendStatus(401);
        } else {
            res.send({username: loggedInUser.username, zipcode: loggedInUser.zipcode});
        }
    } else {
        const profile = await ProfileModel.findOne({username});
        if (!profile)
            res.status(404).send("User does not exist");
        else
            res.send({username: profile.username, zipcode: profile.zipcode});
        }
    }

const updateZipcode = async(req : Request, res : Response) => {
    const {zipcode} = req.body;
    if (!zipcode) {
        res
        .status(400)
        .send("Should send an zipcode");
    }
    const username = await redis.get(req.cookies[cookieKey]);
    let profile = await ProfileModel.findOne({username});
    if (!profile) {
        res.sendStatus(401);
    } else {
        await profile.update({zipcode});
        profile = await ProfileModel.findOne({username})
        res.send({
            username: profile !.username,
            zipcode: profile !.zipcode
        });
    }
}

const getDOB = async(req : Request, res : Response) => {
    const {username} = req.params;
    const loggedInUsername = await redis.get(req.cookies[cookieKey]);
    if (!username) {
        const loggedInUser = await ProfileModel.findOne({
            username: loggedInUsername
        });
        if (!loggedInUser) {
            res.sendStatus(401);
        } else {
            res.send({username: loggedInUser.username, dob: loggedInUser.dob});
        }
    } else {
        const profile = await ProfileModel.findOne({username});
        if (!profile)
            res.status(404).send("User does not exist");
        else
            res.send({username: profile.username, dob: profile.dob});
        }
    }

const getAvatar = async(req : Request, res : Response) => {
    const {username} = req.params;
    const loggedInUsername = await redis.get(req.cookies[cookieKey]);
    if (!username) {
        const loggedInUser = await ProfileModel.findOne({
            username: loggedInUsername
        });
        if (!loggedInUser) {
            res.sendStatus(401);
        } 
        else if(!loggedInUser.avatar) {
            res.status(404).send("User does not have an avatar");
        }
        else {
            res.send({username: loggedInUser.username, avatar: loggedInUser.avatar.replace('http://','https://')});
        }
    } else {
        const profile = await ProfileModel.findOne({username});
        if (!profile)
            res.status(404).send("User does not exist");
        else if (!profile.avatar)
            res.status(404).send("User does not have an avatar");
        else
            res.send({username: profile.username, avatar: profile.avatar.replace('http://','https://')});
        }
    }

const updateAvatar = async(req : CloudinaryRequest, res : Response) => {
    const {avatar} = req.body;

    if (!avatar) {
        res
        .status(400)
        .send("Should send an avatar");
    }
    const username = await redis.get(req.cookies[cookieKey]);
    let profile = await ProfileModel.findOne({username});
    if (!profile) {
        res.sendStatus(401);
    } else {
        await profile.update({avatar: req.fileurl});
        profile = await ProfileModel.findOne({username})
        res.send({
            username: profile !.username,
            avatar: req.fileurl
        });
    }
}

export default function auth(app : Application) {
    app.get('/headline/:username?', getHeadline);
    app.put('/headline', updateHeadline);
    app.get('/email/:username?', getEmail);
    app.put('/email', updateEmail);
    app.get('/zipcode/:username?', getZipcode);
    app.put('/zipcode', updateZipcode);
    app.get('/avatar/:username?', getAvatar);
    app.put('/avatar', uploadImage('avatar'), updateAvatar);
    app.get('/dob/:username?', getDOB);
    app.put('/link-google', linkGoogle);
    app.put('/unlink-google', unlinkGoogle);
}
