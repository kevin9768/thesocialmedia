import { Document } from "mongoose";

export interface IProfile {
    username: string;
    email: string;
    dob: number;
    zipcode: number;
    created: Date;
    phone?: string;
    avatar?: string;
    headline?: string;
    following: string[];
}

export interface IProfileModel extends IProfile,
    Document { }