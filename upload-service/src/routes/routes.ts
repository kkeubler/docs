import express, { Request, Response } from "express";
import multer from "multer";
import {FileService} from "../services/fileService.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const fileService = new FileService();


router.post("/upload", upload.single("file"), async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
    }
    if (req.file.mimetype !== 'application/pdf') {
        res.status(400).json({ message: "Only PDF files are allowed" });
        return;
    }

    try {
        const uploadId = await fileService.uploadFile(req.file);
        res.status(201).json({ uploadId });
    } catch (error) {
        console.error("Upload failed:", error);
        res.status(500).json({ message: "Internal server error during upload" });
    }
});

router.get("/files/:uploadId", async (req: Request, res: Response): Promise<void> => {
    try {
        const filePath = await fileService.getFilePath(req.params.uploadId);
        if (!filePath) {
            res.status(404).json({ message: "File not found" });
            return;
        }
        res.status(200).json({ filePath });
    } catch (error) {
        console.error("Get failed:", error);
        res.status(500).json({ message: "Server error retrieving file path" });
    }
});

router.put("/files/:uploadId", upload.single("file"), async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
        res.status(400).json({ message: "No file in request" });
        return;
    }

    try {
        const success = await fileService.replaceFile(req.params.uploadId, req.file);
        if (!success) {
            res.status(404).json({ message: "File not found" });
            return;
        }
        res.status(200).json({ message: "File successfully replaced" });
    } catch (error) {
        console.error("Replace failed:", error);
        res.status(500).json({ message: "Error replacing file" });
    }
});

router.delete("/files/:uploadId", async (req: Request, res: Response): Promise<void> => {
    try {
        const success = await fileService.deleteFile(req.params.uploadId);
        if (!success) {
            res.status(404).json({ message: "File not found" });
            return;
        }
        res.status(204).send();
    } catch (error) {
        console.error("Delete failed:", error);
        res.status(500).json({ message: "Server error during deletion" });
    }
});

export default router;