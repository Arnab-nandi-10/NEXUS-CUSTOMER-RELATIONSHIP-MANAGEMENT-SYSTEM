import { Schema } from "mongoose";
import mongoose from "mongoose";

const reminder = new Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
        required: true
    },

    channel: {
        type: String,
        enum: ["Email", "SMS"],
        required: true
    },

    subject: String,

    message: {
        type: String,
        required: true
    },

    remindAt:{
        type: Date,
        default: Date.now
    },

    status:{
        type: String,
        enum: ["PENDING", "SENT"],
        default: "PENDING"
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    }
})

export const Reminder = mongoose.model("Reminder", reminder)