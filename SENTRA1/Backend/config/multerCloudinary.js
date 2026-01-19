import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";



console.log("☁️ Cloudinary inside Multer:", {
  cloud: cloudinary.config().cloud_name,
  key: cloudinary.config().api_key ? "OK" : "MISSING",
});


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "sentra/incidents",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "pdf"],
    resource_type: "auto", // ⭐ IMPORTANT: Handle both images and PDFs
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not supported`), false);
    }
  }
});

export default upload;