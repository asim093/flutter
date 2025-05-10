import express from "express";
import { City } from "../Models/City.model.js";

export const Addcities = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      res.status(400).json({ message: "Please provide all fields" });
    }

    const image = req.file?.path;
    if (!image) {
      res.status(400).json({ message: "Please provide an image" });
    }

    const newCity = new City({
      name,
      description,
      image,
    });
    await newCity.save();
    return res
      .status(201)
      .json({ message: "City added successfully", newCity });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const Getcities = async (req, res) => {
  try {
    const cities = await City.find({}).populate("Category");
    res.status(200).json(cities);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteCity = async (req, res) => {
  try {
    const { id } = req.params;
    const CityToDelete = await City.findByIdAndDelete(id);
    if (!CityToDelete) {
      return res.status(404).json({ message: "City not found" });
    }
    return res.status(200).json({ message: "City deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const EditCities = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const updateData = { name, description };

    if (req.file?.path) {
      updateData.image = req.file.path;
    }

    const updatedCity = await City.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedCity) {
      return res.status(404).json({ message: "City not found" });
    }

    return res
      .status(200)
      .json({ message: "City updated successfully", updatedCity });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
