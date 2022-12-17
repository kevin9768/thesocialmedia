import {Model, model, Schema} from 'mongoose';
import {IProfileModel} from '../interfaces/Profile.interface';

const profileSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: [true, 'Username is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required']
    },
    dob: {
        type: Number,
        required: [true, 'Date of birth is required']
    },
    zipcode: {
        type: Number,
        required: [true, 'Zipcode is required']
    },
    phone: {
        type: String,
        required: false
    },
    avatar: {
        type: String,
        required: false
    },
    headline: {
        type: String,
        default: "What's on your mind?",
        required: false
    },
    following: {
        type: [String],
        default: [],
        required: false
    }
})

export const ProfileModel : Model < IProfileModel > = model < IProfileModel > ('Profile', profileSchema);
