import {Model, model, Schema} from 'mongoose';
import {IUserModel} from '../interfaces/User.interface';

const userSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: [true, 'Username is required']
    },
    salt: {
        type: String,
        // required: [true, 'Salt is required']
        required: false
    },
    hash: {
        type: String,
        required: false
        // required: [true, 'Hash is required']
    },
    auth: {
        type: String,
        required: false
    },
    authEmail: {
        type: String,
        required: false
    },
    created: {
        type: Date,
        required: [true, 'Created date is required']
    }
})

export const UserModel : Model < IUserModel > = model < IUserModel > ('User', userSchema);
