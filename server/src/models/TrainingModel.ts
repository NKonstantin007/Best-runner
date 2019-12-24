import * as mongoose from 'mongoose'
import {prop} from 'typegoose';

enum ActivityType {
    RUNNING = 'RUNNING',
    BICYCLE = 'BICYCLE',
    SKIING = 'SKIING',
    WALKING = 'WALKING',
};

export class Training {
    public _id: mongoose.Types.ObjectId;

    @prop({ enum: ActivityType, required: true })
    public activity: ActivityType;

    @prop({ required: true })
    public date: Date;

    @prop({ required: true })
    public distance: number;

    @prop()
    public comment?: string;
};

