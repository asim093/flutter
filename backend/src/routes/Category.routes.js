import express from "express";
import {
  AddCategory,
  deleteCategory,
  EditCategory,
  GetAllCategories,
  GetCategoryByCityname,
} from "../controllers/CategoryController.js";
import authMiddleware from "../middleware/Auth.middleware.js";
import upload from "../middleware/Multer.middleware.js";

const router = express.Router();

router.post("/AddCategory", authMiddleware, upload.single("image") ,  AddCategory);
router.get("/GetCategory", GetAllCategories);
router.delete("/DeleteCategory/:id", authMiddleware, deleteCategory);
router.put("/EditCategory/:id", authMiddleware, upload.single("image"), EditCategory);
router.get("/GetCategorybyCityname" , GetCategoryByCityname)

export default router;
