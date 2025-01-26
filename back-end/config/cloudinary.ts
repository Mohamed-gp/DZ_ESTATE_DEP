import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();
cloudinary.config({

  cloud_name: "drf3vogno",
  api_key: "145858262789143",
  api_secret: "XYwoqvPyOOimJ500_-XKcGPNeww", // Click 'View Credentials' below to copy your API secret

});


export default cloudinary;