# **Upload Service - Technical Documentation**

---

## **1. Architecture Overview**

### **System Components**
The **Upload Service** is a **microservice** designed to handle file uploads, storage, and retrieval. It consists of the following key components:

| **Component**       | **Technology**               | **Purpose**                                                                 |
|---------------------|-----------------------------|-----------------------------------------------------------------------------|
| **Backend Service** | TypeScript + Express.js     | RESTful API for file uploads, retrieval, replacement, and deletion.        |
| **Storage**         | MinIO (S3-compatible)       | Scalable object storage for `.pdf` and `.md` files.                       |
| **Database**        | PostgreSQL                   | Stores metadata (e.g., `uploadId`, `filePath`, `fileName`, `fileSize`).     |
| **Frontend**        | React + Vite + Tailwind CSS | User interface for file uploads (optional, can be integrated via API).      |
| **Docker**          | Docker + Docker Compose     | Containerization for easy deployment and scaling.                           |

---

### **Data Flow**
1. **Upload Request** → Frontend/Client sends a file via `POST /api/v1/upload`.
2. **File Processing** → Express.js handles the upload, validates the file, and stores it in **MinIO**.
3. **Metadata Storage** → PostgreSQL records metadata (e.g., `uploadId`, `filePath`).
4. **Response** → The service returns an `uploadId` for future file operations.
5. **File Operations** → Clients can retrieve, replace, or delete files using the `uploadId`.

---

## **2. Setup & Installation**

### **Prerequisites**
- **Node.js** (v20.0.0+)
- **Docker** & **Docker Compose** (for containerized deployment)
- **PostgreSQL** (for local development, though Docker handles this in production)

---

### **Local Development**
#### **1. Clone the Repository**
```bash
git clone <repository-url>
cd upload-service
```

#### **2. Install Dependencies**
```bash
npm install
cd frontend
npm install
```

#### **3. Run the Backend**
```bash
npm run dev
```
- The backend will start on `http://localhost:3000`.

#### **4. Run the Frontend (Optional)**
```bash
cd frontend
npm run dev
```
- The frontend will start on `http://localhost:5173` (or another port).

---

### **Docker Deployment**
#### **1. Build and Start Containers**
```bash
docker-compose up --build
```
- This will:
  - Start the **Express.js backend** (`http://localhost:3000`).
  - Initialize **MinIO** (`http://localhost:9000` for API, `http://localhost:9001` for UI).
  - Set up **PostgreSQL** (`http://localhost:5432`).

#### **2. Access MinIO Console**
- Open `http://localhost:9001` in a browser.
- Log in with:
  - **Username:** `minioadmin`
  - **Password:** `minioadmin`

#### **3. Access PostgreSQL (Optional)**
- Use a tool like **pgAdmin** or **DBeaver** to connect:
  - Host: `localhost`
  - Port: `5432`
  - Database: `filedb`
  - Username: `myuser`
  - Password: `mypassword`

---

## **3. API Documentation**

### **Base URL**
```
http://localhost:3000/api/v1
```

### **Endpoints**

#### **1. Upload a File**
```http
POST /upload
```
- **Request:**
  - `Content-Type: multipart/form-data`
  - `file`: The PDF or Markdown file to upload.
- **Response:**
  ```json
  {
    "uploadId": "550e8400-e29b-41d4-a716-446655440000"
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: No file uploaded or invalid file type.
  - `500 Internal Server Error`: Upload failed.

#### **2. Get File Path**
```http
GET /files/{uploadId}
```
- **Parameters:**
  - `uploadId` (UUID): Unique identifier for the file.
- **Response:**
  ```json
  {
    "filePath": "uploads/550e8400-e29b-41d4-a716-446655440000.pdf"
  }
  ```
- **Error Responses:**
  - `404 Not Found`: File not found.
  - `500 Internal Server Error`: Database query failed.

#### **3. Replace a File**
```http
PUT /files/{uploadId}
```
- **Request:**
  - `Content-Type: multipart/form-data`
  - `file`: New file to replace the existing one.
- **Response:**
  ```json
  {
    "message": "File successfully replaced"
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: No file provided.
  - `404 Not Found`: File not found.
  - `500 Internal Server Error`: Replacement failed.

#### **4. Delete a File**
```http
DELETE /files/{uploadId}
```
- **Parameters:**
  - `uploadId` (UUID): Unique identifier for the file.
- **Response:**
  ```json
  {
    "message": "File deleted successfully"
  }
  ```
- **Error Responses:**
  - `404 Not Found`: File not found.
  - `500 Internal Server Error`: Deletion failed.

---

### **OpenAPI Specification**
The API is documented using **OpenAPI 3.0**. The specification is available in:
```
upload-service/OpenAPI.yaml
```
This file can be used with tools like **Swagger UI** or **Postman** for interactive API testing.

---

## **4. Database Schema**

### **Table: `documents`**
| **Column**          | **Type**         | **Description**                          |
|---------------------|------------------|------------------------------------------|
| `upload_id`         | `UUID` (PRIMARY) | Unique identifier for the file.           |
| `file_path`         | `TEXT`           | Path to the file in MinIO.               |
| `file_name`         | `TEXT`           | Original filename.                        |
| `file_size`         | `BIGINT`         | Size of the file in bytes.               |
| `file_type`         | `TEXT`           | MIME type (e.g., `application/pdf`).      |
| `upload_timestamp`  | `TIMESTAMP`      | When the file was uploaded.               |

#### **SQL Initialization**
The schema is automatically created on startup via:
```
src/database/init.sql
```

---

## **5. Configuration**

### **Environment Variables**
The service uses `.env` for configuration. Example:
```env
# Server
PORT=3000

# MinIO
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=pdfs

# PostgreSQL
DB_USER=myuser
DB_HOST=db
DB_NAME=filedb
DB_PASSWORD=mypassword
DB_PORT=5432
```

### **Default Values**
If an environment variable is not set, the service falls back to:
- **MinIO**: `minioadmin` credentials, `pdfs` bucket.
- **PostgreSQL**: `myuser`/`mypassword`, `filedb` database.

---

## **6. Development Guidelines**

### **Code Structure**
```
upload-service/
├── src/
│   ├── app.ts          # Express app setup
│   ├── config.ts       # Configuration loader
│   ├── database/       # Database utilities
│   ├── routes/        # API routes
│   ├── services/      # Business logic (e.g., FileService)
│   └── types/         # TypeScript interfaces
├── frontend/           # React frontend (optional)
├── Dockerfile         # Multi-stage Docker build
├── docker-compose.yaml # Container orchestration
├── .gitignore         # Ignored files
└── package.json        # Dependencies
```

### **Best Practices**
1. **Type Safety**: Use TypeScript for all backend code.
2. **Error Handling**: Validate inputs and handle errors gracefully.
3. **Logging**: Use structured logging (e.g., `console.error` for errors).
4. **Testing**: Write unit tests for critical functions (e.g., file uploads).
5. **Security**:
   - Use HTTPS in production.
   - Restrict MinIO access via IAM policies.
   - Sanitize file uploads to prevent injection attacks.

---

## **7. Deployment Instructions**

### **Production Deployment**
1. **Build the Docker Image**:
   ```bash
   docker-compose build
   ```
2. **Start the Services**:
   ```bash
   docker-compose up -d
   ```
3. **Verify**:
   - Backend: `http://localhost:3000/health` (should return `{ "status": "UP" }`).
   - MinIO: `http://localhost:9001` (accessible via browser).
   - PostgreSQL: Verify connection via `psql -h localhost -U myuser -d filedb`.

### **Scaling**
- **Horizontal Scaling**: Deploy multiple instances of the backend behind a load balancer (e.g., Nginx).
- **MinIO Scaling**: Use MinIO’s distributed mode for high availability.
- **Database**: Use PostgreSQL read replicas for read-heavy workloads.

---

## **8. Troubleshooting**

| **Issue**                          | **Solution**                                                                 |
|-------------------------------------|-----------------------------------------------------------------------------|
| **Backend not starting**             | Check logs with `docker-compose logs upload-service`.                        |
| **MinIO bucket not found**          | Ensure the bucket exists (`docker-compose logs minio`).                      |
| **Database connection failed**       | Verify PostgreSQL credentials and network access.                           |
| **File uploads failing**            | Check MinIO storage limits and file size restrictions.                     |
| **Frontend not loading**            | Ensure CORS is enabled (`app.use(cors())`).                                |

---

## **9. Contributing**
1. **Fork the Repository**: Create a personal copy.
2. **Create a Branch**: `git checkout -b feature/your-feature`.
3. **Commit Changes**: `git commit -m "Add new feature"`.
4. **Push**: `git push origin feature/your-feature`.
5. **Open a Pull Request**: Describe the changes clearly.

---

## **10. License**
This project is licensed under the **ISC License**. See `LICENSE` for details.

---

## **Appendix: Key Dependencies**
| **Package**       | **Purpose**                                                                 |
|-------------------|-----------------------------------------------------------------------------|
| `express`         | Web framework for building the API.                                         |
| `minio`           | Client for MinIO S3-compatible storage.                                     |
| `multer`          | Middleware for handling file uploads.                                        |
| `pg`              | PostgreSQL client for metadata storage.                                      |
| `uuid`            | Generates unique `uploadId`s.                                               |
| `cors`            | Enables Cross-Origin Resource Sharing.                                       |
| `@types/*`        | TypeScript type definitions for dependencies.                                |

---

This documentation provides a **comprehensive technical overview** of the Upload Service. For further details, refer to the source code and OpenAPI specification.