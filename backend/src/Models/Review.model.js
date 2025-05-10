import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    AttractionId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attraction",
        required: true
    },
    rating : {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    review : {
        type: String,
        required: true
    },
    createdAt : {
        type: Date,
        default: Date.now
    }
})

export const Review = mongoose.model("Review", reviewSchema);