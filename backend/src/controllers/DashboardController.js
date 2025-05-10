import { Usermodle } from "../Models/User.model.js";
import { City } from "../Models/City.model.js";
import { Category } from "../Models/Category.model.js";
import { Attraction } from "../Models/Attraction.model.js";
import mongoose from "mongoose";

export const getDashboardStats = async (req, res) => {
  try {
    const [userCount, cityCount, categoryCount, attractionCount] = await Promise.all([
      Usermodle.countDocuments(),
      City.countDocuments(),
      Category.countDocuments(),
      Attraction.countDocuments()
    ]);

    const topCities = await City.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "CityId",
          as: "categories"
        }
      },
      {
        $lookup: {
          from: "attractions",
          localField: "_id",
          foreignField: "City",
          as: "attractions"
        }
      },
      {
        $project: {
          name: 1,
          categories: { $size: "$categories" },
          attractions: { $size: "$attractions" }
        }
      },
      { $sort: { attractions: -1 } },
      { $limit: 4 }
    ]);

   
    const recentReviews = [];
    
    const newUsers = Math.floor(userCount * 0.1);
    const newAttractions = Math.floor(attractionCount * 0.05); 
    const newCities = Math.floor(cityCount * 0.02); 

    res.status(200).json({
      totalUsers: userCount,
      totalCities: cityCount,
      totalCategories: categoryCount,
      totalAttractions: attractionCount,
      topCities,
      recentReviews,
      newUsers,
      newAttractions,
      newCities
    });
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    res.status(500).json({ message: "Failed to fetch dashboard statistics" });
  }
};