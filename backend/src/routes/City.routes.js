import express from "express";
import { Addcities, deleteCity, EditCities, Getcities } from "../controllers/CitiesController.js";
import authmiddleware from "../middleware/Auth.middleware.js";
import upload from "../middleware/Multer.middleware.js";

const router = express.Router();

router.post("/city", authmiddleware, upload.single('image') ,  Addcities);
router.get("/city", Getcities);
router.put("/city/:id" , authmiddleware , upload.single('image') ,  EditCities );
router.delete("/city/:id" ,  authmiddleware , deleteCity );
export default router;
