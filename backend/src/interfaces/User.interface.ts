import {Document} from "mongoose";

export interface IUser {
    username : string;
    salt ?: string;
    hash ?: string;
    auth ?: string;
    authEmail ?: string;
}

export interface IUserModel extends IUser,
Document {}