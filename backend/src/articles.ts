import { Application, Request, Response } from "express";
import { redis } from "../redis";
import { cookieKey } from "./auth";
import { CloudinaryRequest, uploadImage } from "./middleware/uploadCloudinary";
import { ArticleModel } from "./models/Article.model";
import { UserModel } from "./models/User.model";

const getArticles = async (req: Request, res: Response) => {
    const { id } = req.params;
    let articles;
    const loggedInUsername = await redis.get(req.cookies[cookieKey]);
    if (!id) {
        articles = await ArticleModel.find({
            author: loggedInUsername
        });
        res.send({ articles });
    } else if (isNaN(id as any)) {
        const user = await UserModel.findOne({ username: id });
        if (!user) {
            res
                .status(404)
                .send("User does not exist");
        } else {
            articles = await ArticleModel.find({ author: id });
            res.send({ articles });
        }
    } else {
        const article = await ArticleModel.findOne({ pid: id });
        if (!article) {
            res
                .status(404)
                .send("Article does not exist");
        } else {
            res.send({ articles: [article] });
        }
    }

}

const addArticle = async (req: CloudinaryRequest, res: Response) => {
    const { text } = req.body;
    const loggedInUsername = await redis.get(req.cookies[cookieKey]);
    if (!text) {
        res
            .status(400)
            .send("Should send text");
    }
    const user = await UserModel.findOne({
        username: loggedInUsername
    });
    if (!user) {
        res.status(401);
    } else {
        const length = await ArticleModel.count();
        const article = new ArticleModel({
            pid: length + 1,
            author: user.username,
            text,
            date: new Date(),
            img: req.fileurl ? req.fileurl : "",
            comments: []
        });
        await article.save();
        res.send({ articles: [article] });
    }
}

const editArticle = async (req: Request, res: Response) => {
    let { id } = req.params;
    let { text, commentId } : {text: string, commentId: number} = req.body;

    const loggedInUsername = await redis.get(req.cookies[cookieKey]);
    const user = await UserModel.findOne({
        username: loggedInUsername
    });
    if(!user){
        res.sendStatus(401);
    }
    else {
        let article = await ArticleModel.findOne({pid: id});
        if (!article){
            res.status(404).send("Article not found");
        }
        else{
            if (!text) {
                res.status(400).send("Should send text");
            } else {
                if (commentId === undefined) {
                    await article.updateOne({text});
                } else {
                    let comments = article.comments
                    if (commentId === -1) {
                        if(comments)
                        comments = [...comments, {author: user.username, text: text}];
                        else
                        comments = [{author: user.username, text: text}];
                        await article.updateOne({comments});
                    }
                    else if (!comments || commentId >= comments?.length) {
                        res.status(404).send("Comment not found");
                    }
                    else {
                        if(comments[commentId].author != user.username){
                            res.sendStatus(401);
                        }
                        else {
                            comments[commentId].text = text;
                            await article.updateOne({comments});
                        }
                    }
                }
                article = await ArticleModel.findOne({pid: id});
                res.send({ articles: [article] });
            }
        }
    }
}

export default function articles(app: Application) {
    app.get('/articles/:id?', getArticles);
    app.put('/articles/:id', editArticle);
    app.post('/article', uploadImage('postFeed'), addArticle);
}