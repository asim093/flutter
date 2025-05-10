import express from "express";
import { Attraction } from "../Models/Attraction.model.js";
import { Category } from "../Models/Category.model.js";

export const addAttraction = async (req, res) => {
  try {
    const { name, description, category, city, latitude, longitude } = req.body;

    if (
      !name ||
      !description ||
      !category ||
      !city ||
      !latitude ||
      !longitude
    ) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    const image = req.file?.path;
    if (!image) {
      return res.status(400).json({ message: "Please provide an image" });
    }

    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(404).json({ message: "Category not found" });
    }

    const attraction = new Attraction({
      name,
      description,
      image,
      Category: category,
      City: city,
      latitude,
      longitude,
    });

    await attraction.save();

    categoryDoc.Attractions.push(attraction._id);
    await categoryDoc.save();

    res.status(201).json({
      message: "Attraction added successfully",
      attraction,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllAttractions = async (req, res) => {
  try {
    const attractions = await Attraction.find({})
      .populate("Category", "name")
      .populate("City", "name");

    if (!attractions || attractions.length === 0) {
      return res.status(404).json({ message: "No attractions found" });
    }

    res.status(200).json(attractions);
  } catch (error) {
    console.error("Error fetching attractions:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateAttraction = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, city, latitude, longitude } = req.body;

    if (
      !name ||
      !description ||
      !category ||
      !city ||
      !latitude ||
      !longitude
    ) {
      return res.status(400).json({ message: "Please fill all the fields" });
    }

    const attraction = await Attraction.findById(id);
    if (!attraction) {
      return res.status(404).json({ message: "Attraction not found" });
    }

    if (req.file) {
      attraction.image = req.file.path;
    }

    if (attraction.category.toString() !== category) {
      await Category.findByIdAndUpdate(attraction.category, {
        $pull: { Attractions: attraction._id },
      });

      const newCategory = await Category.findById(category);
      if (!newCategory) {
        return res.status(404).json({ message: "Category not found" });
      }

      newCategory.Attractions.push(attraction._id);
      await newCategory.save();
    }

    // Update attraction fields
    attraction.name = name;
    attraction.description = description;
    attraction.category = category;
    attraction.city = city;
    attraction.latitude = latitude;
    attraction.longitude = longitude;

    await attraction.save();

    res.status(200).json({
      message: "Attraction updated successfully",
      attraction,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAttraction = async (req, res) => {
  try {
    const { id } = req.params;

    const attraction = await Attraction.findById(id);
    if (!attraction) {
      return res.status(404).json({ message: "Attraction not found" });
    }

    await Category.findByIdAndUpdate(attraction.category, {
      $pull: { Attractions: attraction._id },
    });

    await Attraction.findByIdAndDelete(id);

    res.status(200).json({
      message: "Attraction deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const GetAttractionByCity = async (req, res) => {
  try {
    const { cityName, categoryName } = req.query;

    if (!cityName || !categoryName) {
      return res
        .status(400)
        .json({ message: "Cityname and Categoryname are required" });
    }

    const attractions = await Attraction.find({})
      .populate("Category", "name")
      .populate("City", "name");

    if (!attractions || attractions.length === 0) {
      return res.status(404).json({ message: "No attractions found" });
    }

    const filteredAttractions = attractions.filter((attraction) => {
      if (!attraction.City || !attraction.Category) {
        return false;
      }

      const cityMatch =
        attraction.City?.name?.toLowerCase() === cityName.toLowerCase();
      const categoryMatch =
        attraction.Category?.name?.toLowerCase() === categoryName.toLowerCase();

      return cityMatch && categoryMatch;
    });

    if (filteredAttractions.length === 0) {
      return res.status(404).json({
        message: "No attractions found for the given city and category",
      });
    }

    res.status(200).json(filteredAttractions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const GetAttractionByname = async (req, res) => {
  try {
    const { name } = req.query;

    const attractions = await Attraction.find({})
      .populate("Category", "name")
      .populate("City", "name")
      .populate({
        path: "reviews",
        populate: {
          path: "userId", 
          model: "User", 
        },
      });

    if (!attractions || attractions.length === 0) {
      return res.status(404).json({ message: "No attractions found" });
    }

    const filteredAttractions = attractions.filter((attraction) => {
      if (!attraction.City || !attraction.Category) {
        return false;
      }

      const nameMatch = attraction.name?.toLowerCase() === name.toLowerCase();

      return nameMatch;
    });

    res.status(200).json(filteredAttractions);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
