import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import "dotenv-safe/config";
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { connect, ConnectOptions } from 'mongoose';
import auth, { isLoggedIn } from './src/auth';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import profile from './src/profile';
import articles from './src/articles';
import following from './src/following';
import { AddressInfo } from 'net';
import { setup as cloudinarySetup } from './src/middleware/uploadCloudinary';
import session from 'express-session';
import passport from 'passport';


const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true
};


let redirect = "/";

const app = express();
connect(process.env.MONGODB_URI!, { useNewUrlParser: true, useUnifiedTopology: true } as ConnectOptions);
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.set("trust proxy", 1);
app.use(session({
    secret: process.env.SESSION_SECRET!,
    resave: true,
    saveUninitialized: false,
    cookie : {
        sameSite: 'none',
        secure: true
    }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    done(null, user);
});

export interface PassportUser {
    email: string;
    name: string;
    id: string;
    token: string;
}

passport.deserializeUser(function(user: PassportUser, done) {
    done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: '256243851311-a4i2bfph0tch5jrg4u3d0g9g331rvtm3.apps.googleusercontent.com',
    clientSecret: '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',
    // callbackURL: "/auth/google/callback",
    callbackURL: process.env.GOOGLE_CALLBACK!,
},
    function(accessToken: string, _refreshToken: string, profile: any, done: Function) {
        let user = {
            'email': profile.emails[0].value,
            'name' : profile.name.givenName + ' ' + profile.name.familyName,
            'id'   : profile.id,
            'token': accessToken
        };
    return done(null, user);

}));

app.get('/auth/google/:uri?', 
(req:Request, res: Response, next: NextFunction)=>{
    let { uri } = req.params;
    if(uri === 'callback'){
        // console.log(req.cookies['connect.sid']);
        passport.authenticate('google', {failureRedirect: process.env.FRONTEND_URL, successReturnToOrRedirect: process.env.FRONTEND_URL+redirect})(req, res,next);
        res.cookie('connect.sid', req.cookies['connect.sid'],  {
            httpOnly: true,
            sameSite: 'none',
            secure: true
        });
    }
    else {
        if(uri)
            redirect = '/'+uri;
        passport.authenticate('google', {scope: ['https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/userinfo.email']})(req,res,next);
    }

});


cloudinarySetup(app);
auth(app);
app.use(isLoggedIn);
profile(app);
articles(app);
following(app);

// Get the port from the environment, i.e., Heroku sets it
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
     const addr = server.address() as AddressInfo;
     console.log(`Server listening at http://${addr.address}:${port}`)
});
