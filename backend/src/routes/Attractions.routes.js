import express from 'express';
import { addAttraction, deleteAttraction, getAllAttractions, GetAttractionByCity, GetAttractionByname, updateAttraction } from '../controllers/AttractionsController.js';
import authMiddleware from '../middleware/Auth.middleware.js';
import upload from '../middleware/Multer.middleware.js';

const router = express.Router();

router.get('/getattractions' , getAllAttractions ),
router.post('/addattractions', upload.single("image") , authMiddleware ,  addAttraction  ),
router.put("/attraction/:id", upload.single("image"), updateAttraction);
router.delete("/attraction/:id", deleteAttraction);
router.get("/attraction", GetAttractionByCity);
router.get("/attractionByname", GetAttractionByname);

export default router;