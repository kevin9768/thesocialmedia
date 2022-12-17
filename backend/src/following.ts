import {Response, Request, Application} from "express";
import { redis } from "../redis";
import {cookieKey} from "./auth";
import {ProfileModel} from "./models/Profile.model";

const getFollowing = async(req : Request, res : Response) => {
    const {username} = req.params;
    const loggedInUsername = await redis.get(req.cookies[cookieKey]);
    if (!username) {
        const loggedInUser = await ProfileModel.findOne({
            // username: sessionUser[req.cookies[cookieKey]]
            username: loggedInUsername
        });
        if (!loggedInUser) {
            res.sendStatus(401);
        } else {
            res.send({username: loggedInUser.username, following: loggedInUser.following});
        }
    } else {
        const user = await ProfileModel.findOne({username});
        if (!user)
            res.status(404).send("User does not exist");
        else
            res.send({username: user.username, following: user.following});
        }
    }

const addFollowing = async(req : Request, res : Response) => {
    const {username} = req.params;
    const loggedInUsername = await redis.get(req.cookies[cookieKey]);
    if (!username) {
        res
            .status(400)
            .send("Should send a username");
    } else {
        let loggedInUser = await ProfileModel.findOne({
            username: loggedInUsername
        });
        if (!loggedInUser) {
            res.sendStatus(401);
        } else if (loggedInUser.username === username) {
            res
                .status(400)
                .send("Cannot follow yourself");
        } else if (loggedInUser.following.indexOf(username) !== -1) {
            res
                .status(400)
                .send("Already following");
        } else {
            const newFollowing = await ProfileModel.findOne({username});
            if (!newFollowing)
                res.status(404).send("User does not exist");
            else {
                await loggedInUser.updateOne({
                    following: [
                        ...loggedInUser.following,
                        username
                    ]
                });
                loggedInUser = await ProfileModel.findOne({
                    username: loggedInUsername
                });
                res.send({
                    username: loggedInUser !.username,
                    following: loggedInUser !.following
                });
            }
        }
    }
}

const deleteFollowing = async(req : Request, res : Response) => {
    const {username} = req.params;
    const loggedInUsername = await redis.get(req.cookies[cookieKey]);
    if (!username) {
        res
            .status(400)
            .send("Should send a username");
    } else {
        let loggedInUser = await ProfileModel.findOne({
            username: loggedInUsername
        });
        if (!loggedInUser) {
            res.sendStatus(401);
        } else if (loggedInUser.username === username) {
            res
                .status(400)
                .send("Cannot unfollow yourself");
        } else {
            const index = loggedInUser
                .following
                .indexOf(username);
            if (index === -1) {
                res
                    .status(404)
                    .send("User is not found in following list");
            } else {
                await loggedInUser.updateOne({
                    following: loggedInUser
                        .following
                        .filter((elem)=>elem!=username)
                });
                loggedInUser = await ProfileModel.findOne({
                    username: loggedInUsername
                });
                res.send({
                    username: loggedInUser!.username,
                    following: loggedInUser!.following
                });
            }
        }
    }
}

export default function following(app : Application) {
    app.get('/following/:username?', getFollowing);
    app.put('/following/:username', addFollowing);
    app.delete('/following/:username', deleteFollowing);
}