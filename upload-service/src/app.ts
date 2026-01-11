import express from "express";
import cors from "cors";
import uploadRoutes from "./routes/routes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP' });
});

// API Routes
app.use("/api/v1", uploadRoutes);

export default app;