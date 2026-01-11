import { Server } from 'http';
import app from "./app.js";
import {config} from "./config.js";
import {FileService} from "./services/fileService.js";

const startServer = async () => {
    let server: Server | null = null;

    try {
        console.log("Initializing services...");

        // Initialize services
        const fileService = new FileService();
        await fileService.initializeResources();

        // Start server
        const port = config.server.port;
        server = app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
            console.log(`API available at http://localhost:${port}/api/v1/upload`);
        });

        // Graceful shutdown handler
        const shutdown = async (signal: string) => {
            console.log(`${signal} received, shutting down gracefully...`);

            if (server) {
                server.close(async () => {
                    console.log('HTTP server closed');
                    process.exit(0);
                });
            } else {
                process.exit(0);
            }
        };

        // Register signal handlers
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));

        // Unhandled rejection handler
        process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
            shutdown('UNHANDLED_REJECTION');
        });

    } catch (error) {
        console.error("Failed to start server:", error);

        // Close server if partially started
        if (server) {
            server.close();
        }

        process.exit(1);
    }
};

startServer().catch((error) => {
    console.error("Unexpected error during server startup:", error);
    process.exit(1);
});