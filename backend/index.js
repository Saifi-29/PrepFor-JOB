import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import testRoute from "./routes/test.route.js";
import resumeRoute from "./routes/resumeRoutes.js";

dotenv.config({});

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

// CORS configuration
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Cookie'],
    exposedHeaders: ['Content-Disposition', 'Content-Type', 'Set-Cookie']
}));

// Handle pre-flight requests
app.options('*', cors());

const PORT = process.env.PORT || 8000;

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    // Handle multer errors
    if (err.name === 'MulterError') {
        return res.status(400).json({
            message: "File upload error: " + err.message,
            success: false
        });
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: err.message,
            success: false
        });
    }
    
    // Handle other errors
    res.status(err.status || 500).json({
        message: err.message || "Something went wrong!",
        success: false
    });
});

// api's
app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);
app.use("/api/v1/test", testRoute);
app.use("/api/resume", resumeRoute);

// Handle 404
app.use((req, res) => {
    res.status(404).json({
        message: "Route not found",
        success: false
    });
});

app.listen(PORT,()=>{
    connectDB();
    console.log(`Server running at port ${PORT}`);
});