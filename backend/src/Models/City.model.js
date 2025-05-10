import mongoose from "mongoose";

const Cityschema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  Category: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
});
export const City = mongoose.model("City", Cityschema);
