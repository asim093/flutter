import express from "express";
import { Category} from "../Models/Category.model.js";
import { City } from "../Models/City.model.js";

export const AddCategory = async (req, res) => {
  try {
    const { name, description, cityId } = req.body;

    if (!name || !description || !cityId) {
      return res
        .status(400)
        .json({ message: "Please fill all the fields and provide a City ID" });
    }

    const image = req.file?.path;
    if (!image) {
      return res.status(400).json({ message: "Please provide an image" });
    }

    const city = await City.findById(cityId);
    if (!city) {
      return res.status(404).json({ message: "City not found" });
    }

    const category = new Category({
      name,
      description,
      image,
      CityId: cityId,
    });

    await category.save();

    city.Category.push(category._id);
    await city.save();

    res.status(201).json({
      message: "Category added successfully",
      category,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const GetAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).populate("CityId", "name");
    if (!categories) {
      return res.status(404).json({ message: "No categories found" });
    }
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const EditCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const updateData = { name, description };

    if (req.file?.path) {
      updateData.image = req.file.path;
    }

    const updatedCategory = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("CityId", "name");

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json({
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Edit category error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const GetCategoryByCityname = async (req, res) => {
  try {
    const { name } = req.query;

    const allCategories = await Category.find().populate("CityId");

    const filteredCategories = allCategories.filter((category) =>
      category.CityId?.name?.trim().toLowerCase() === name.trim().toLowerCase()
    );
    res.status(200).json({
      message: "Category Fetch Successfull",
      categories: filteredCategories,
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};




