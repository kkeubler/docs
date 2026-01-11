import { v4 as uuidv4 } from 'uuid';
import * as Minio from 'minio';
import { Pool } from 'pg';
import { config } from '../config.js';

export class FileService {
    private minioClient: Minio.Client;
    private pool: Pool;

    constructor() {
        this.pool = new Pool(config.db);
        this.minioClient = new Minio.Client(config.minio);
    }

    /**
     * Initializes Database tables and MinIO buckets.
     * Should be called once at server startup.
     */
    async initializeResources(): Promise<void> {
        await this.initDb();
        await this.initMinio();
    }

    private async initDb(): Promise<void> {
        const client = await this.pool.connect();
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS documents (
                    upload_id UUID PRIMARY KEY,
                    file_path TEXT NOT NULL,
                    file_name TEXT NOT NULL,
                    file_size BIGINT NOT NULL,
                    file_type TEXT NOT NULL,
                    upload_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            `);
            console.log("Database schema initialized successfully.");
        } catch (err) {
            console.error("Failed to initialize database:", err);
            throw err;
        } finally {
            client.release();
        }
    }

    private async initMinio(): Promise<void> {
        const bucketName = config.minio.bucketName;
        try {
            const exists = await this.minioClient.bucketExists(bucketName);
            if (!exists) {
                // 'us-east-1' is required as a placeholder for region
                await this.minioClient.makeBucket(bucketName, 'us-east-1');
                console.log(`Bucket '${bucketName}' created successfully.`);
            } else {
                console.log(`Bucket '${bucketName}' already exists.`);
            }
        } catch (err) {
            console.error("Failed to initialize MinIO bucket:", err);
            throw err;
        }
    }

    /**
     * Uploads a file to MinIO and saves metadata to Postgres.
     * Returns the generated uploadId.
     */
    async uploadFile(file: Express.Multer.File): Promise<string> {
        const uploadId = uuidv4();
        // Use UUID as object name to prevent collisions
        const objectName = `${uploadId}.pdf`;
        const bucketName = config.minio.bucketName;
        const minioPath = `minio://${bucketName}/${objectName}`;

        // 1. Upload to MinIO first
        try {
            await this.minioClient.putObject(
                bucketName,
                objectName,
                file.buffer,
                file.size,
                { 'Content-Type': file.mimetype }
            );
        } catch (minioError) {
            console.error("MinIO upload failed:", minioError);
            throw new Error("Failed to store file data");
        }

        // 2. Insert into DB
        try {
            const query = `
                INSERT INTO documents (upload_id, file_path, file_name, file_size, file_type)
                VALUES ($1, $2, $3, $4, $5)
            `;
            await this.pool.query(query, [
                uploadId,
                minioPath,
                file.originalname,
                file.size,
                file.mimetype
            ]);

            return uploadId;

        } catch (dbError) {
            console.error("Database insert failed. Rolling back MinIO upload...", dbError);

            // COMPENSATION: Delete the orphaned file from MinIO
            await this.minioClient.removeObject(bucketName, objectName)
                .catch(cleanupErr => console.error("Failed to cleanup orphaned MinIO file:", cleanupErr));

            throw new Error("Failed to save file metadata");
        }
    }

    /**
     * Retrieves the file path (URI) for a given uploadId.
     * Returns null if not found.
     */
    async getFilePath(uploadId: string): Promise<string | null> {
        try {
            const result = await this.pool.query(
                'SELECT file_path FROM documents WHERE upload_id = $1',
                [uploadId]
            );

            if (result.rows.length === 0) {
                return null;
            }
            return result.rows[0].file_path;
        } catch (error) {
            console.error(`Error retrieving file path for ${uploadId}:`, error);
            throw error;
        }
    }

    /**
     * Replaces an existing file's content and updates metadata.
     * Returns true if successful, false if file not found.
     */
    async replaceFile(uploadId: string, file: Express.Multer.File): Promise<boolean> {
        // 1. Check if record exists
        const existingPath = await this.getFilePath(uploadId);
        if (!existingPath) {
            return false;
        }

        const bucketName = config.minio.bucketName;
        // Construct object name based on ID (assumes .pdf extension strategy)
        const objectName = `${uploadId}.pdf`;

        try {
            // 2. Overwrite in MinIO
            await this.minioClient.putObject(
                bucketName,
                objectName,
                file.buffer,
                file.size,
                { 'Content-Type': file.mimetype }
            );

            // 3. Update Metadata in DB
            await this.pool.query(
                `UPDATE documents 
                 SET file_name = $1, file_size = $2, file_type = $3, upload_timestamp = CURRENT_TIMESTAMP
                 WHERE upload_id = $4`,
                [file.originalname, file.size, file.mimetype, uploadId]
            );

            return true;

        } catch (error) {
            console.error(`Error replacing file ${uploadId}:`, error);
            throw error;
        }
    }

    /**
     * Deletes a file from DB and MinIO.
     * Returns true if deleted, false if not found.
     */
    async deleteFile(uploadId: string): Promise<boolean> {
        try {
            // 1. Delete from DB first (and get the path to know what to delete in MinIO)
            const result = await this.pool.query(
                'DELETE FROM documents WHERE upload_id = $1 RETURNING file_path',
                [uploadId]
            );

            if (result.rows.length === 0) {
                return false;
            }

            const filePath = result.rows[0].file_path; // e.g., minio://bucket/uuid.pdf

            // Extract object name from path
            // Assumes format: minio://bucketName/objectName
            const prefix = `minio://${config.minio.bucketName}/`;
            const objectName = filePath.replace(prefix, '');

            // 2. Delete from MinIO
            if (objectName) {
                await this.minioClient.removeObject(config.minio.bucketName, objectName);
            } else {
                console.warn(`Could not parse object name from path: ${filePath}`);
            }

            return true;

        } catch (error) {
            console.error(`Error deleting file ${uploadId}:`, error);
            throw error;
        }
    }
}