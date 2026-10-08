import app from "../src/app.js";
import connectMongoDb from "../src/database/mongo.db.js";

export default async function handler(req, res) {
  try {
    await connectMongoDb();
    return app(req, res);
  } catch (error) {
    console.error("Database connection failed:", error);
    return res.status(503).json({
      success: false,
      message: "The API is temporarily unavailable",
    });
  }
}
