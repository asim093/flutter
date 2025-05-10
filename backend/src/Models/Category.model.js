import mongoose from "mongoose";

const CategorySchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  CityId : { type: mongoose.Schema.Types.ObjectId, ref: "City" },
  Attractions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Attraction" }],

});

export  const Category = mongoose.model("Category", CategorySchema);