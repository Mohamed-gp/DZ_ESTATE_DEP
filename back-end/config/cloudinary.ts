import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Check if Cloudinary environment variables are available
const hasCloudinaryConfig =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log("✅ Cloudinary configured successfully");
} else {
  console.log(
    "⚠️  Cloudinary configuration not found - using development mode"
  );
  // Configure with dummy values for development
  cloudinary.config({
    cloud_name: "dev-placeholder",
    api_key: "dev-placeholder",
    api_secret: "dev-placeholder",
  });
}

export default cloudinary;
export { hasCloudinaryConfig };
