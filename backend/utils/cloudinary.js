import {v2 as cloudinary} from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

// Configure cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dayzekbzl',
    api_key: process.env.CLOUDINARY_API_KEY || '191194722698411',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'kSmTVfY6vVKhM7IBzI4hFnYgjNQ'
});

// Helper function to handle file upload
export const uploadToCloudinary = async (fileUri) => {
    try {
        const result = await cloudinary.uploader.upload(fileUri, {
            folder: 'job_portal',
            resource_type: 'auto',
            allowed_formats: ['jpg', 'jpeg', 'png'],
            transformation: [
                { width: 500, height: 500, crop: 'limit' }
            ]
        });
        return result;
    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        throw new Error('Failed to upload file to cloud storage');
    }
};

export default cloudinary;