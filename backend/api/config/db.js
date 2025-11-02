import mongoose from "mongoose";

const connectDB = async () => {
  // Skip connection during Jest tests
  if (process.env.NODE_ENV === "test") {
    console.log("Skipping MongoDB connection in test mode");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    if (process.env.NODE_ENV !== "test") process.exit(1);
  }
};

export default connectDB;
