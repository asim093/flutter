import express from "express";
import { addReview, deleteReview, getAllReviews } from "../controllers/ReviewController.js";
import authMiddleware from "../middleware/Auth.middleware.js";
const router = express.Router();

router.get("/getreview" , getAllReviews),
  router.post("/addreview" , addReview),
  router.delete("/deletereview/:id" , authMiddleware , deleteReview),
  router.put("/editreview/:id");

export default router;