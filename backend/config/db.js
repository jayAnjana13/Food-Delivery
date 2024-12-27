import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose
    .connect(
      "mongodb+srv://jayanjana13:ffbNsv7NezTkEe72@jay13.bg4vx.mongodb.net/food-delivery"
    )
    .then(() => console.log("DB Connected"));
};
