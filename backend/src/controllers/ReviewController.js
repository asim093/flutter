import express from "express";
import { Attraction } from "../Models/Attraction.model.js";
import { Usermodle } from "../Models/User.model.js";
import { Review } from "../Models/Review.model.js";

export const addReview = async (req, res) => {
  try {
    const { userId, AttractionId, rating, review } = req.body;

    if (!userId || !AttractionId || !rating || !review) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    const attractionDoc = await Attraction.findById(AttractionId);
    if (!attractionDoc) {
      return res.status(404).json({ message: "Attraction not found" });
    }

    const user = await Usermodle.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newReviewDoc = new Review({ userId, AttractionId, rating, review });
    await newReviewDoc.save();

    attractionDoc.reviews.push(newReviewDoc._id);
    await attractionDoc.save();

    user.reviews.push(newReviewDoc._id);
    await user.save();

    res
      .status(201)
      .json({ message: "Review added successfully", newReview: newReviewDoc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate("userId", "name email profileImage")
      .populate("AttractionId", "name description image");
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
