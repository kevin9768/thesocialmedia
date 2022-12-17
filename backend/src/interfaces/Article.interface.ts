import { Document } from "mongoose";

interface IComment {
    author: string;
    text: string;
}
export interface IAritcle {
    pid: number;
    author: string;
    text: string;
    date: Date;
    img: string;
    comments?: IComment[];
}

export interface IArticleModel extends IAritcle,
    Document { }