import express from "express";
import dotenv from "dotenv";
import userroutes from "./src/routes/UserRoutes.js";
import cityRoutes from "./src/routes/City.routes.js";
import Categoryroutes from "./src/routes/Category.routes.js";
import attractionRoutes from "./src/routes/Attractions.routes.js";
import reviewRoutes from "./src/routes/Review.routes.js";
import connectDb from "./src/db/index.js";
import cors from "cors";

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/user", userroutes);
app.use("/api/user", Categoryroutes);
app.use("/api/user", cityRoutes);
app.use("/api/user", attractionRoutes);
app.use("/api/user", reviewRoutes);

connectDb()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  });
