import mongoose from "mongoose";

const AttractionSchema = mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    Category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    City: { type: mongoose.Schema.Types.ObjectId, ref: "City" },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
}) 

export const Attraction = mongoose.model("Attraction", AttractionSchema);