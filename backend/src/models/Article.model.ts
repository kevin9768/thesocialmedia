import { Model, model, Schema } from 'mongoose';
import { IArticleModel } from 'src/interfaces/Article.interface';

const commentSchema = new Schema({
    author: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    }
})

const articleSchema = new Schema({
    pid: {
        type: Number,
        unique: true,
        required: [true, 'pid is required']
    },
    author: {
        type: String,
        required: [true, 'Author is required']
    },
    text: {
        type: String,
        required: [true, 'Text is required']
    },
    date: {
        type: Date,
        required: [true, 'Created date is required']
    },
    img: {
        type: String,
        required: false
    },
    comments: {
        type: [commentSchema],
        required: false
    },
})


export const ArticleModel: Model<IArticleModel> = model<IArticleModel>('Article', articleSchema);
