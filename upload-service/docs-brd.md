# **Business Requirements Document (BRD)**
**Project:** **Upload Service**
**Version:** 1.0
**Date:** [Insert Date]
**Author:** [Your Name/Team]

---

## **1. Executive Summary**
### **Project Overview**
The **Upload Service** is a scalable, microservice-based solution designed to enable users to upload, retrieve, replace, and delete `.pdf` and `.md` files. The service integrates with a **MinIO S3-compatible object storage** for file storage and a **PostgreSQL database** for metadata management.

### **Business Objectives**
- Provide a **secure, reliable, and efficient** file upload mechanism for users.
- Enable **real-time file management** (upload, download, replace, delete) via RESTful API.
- Ensure **scalability** to handle high-volume file uploads.
- Integrate seamlessly with **existing systems** (e.g., course management platforms).
- Provide a **user-friendly frontend** for file uploads.

### **Expected Outcomes**
- **Increased productivity** for users by simplifying file management.
- **Reduced operational overhead** for backend systems through centralized file handling.
- **Improved data accessibility** with structured metadata storage.
- **Enhanced security** with proper authentication and storage isolation.

---

## **2. Project Scope**

### **In-Scope Features**
| **Feature**               | **Description**                                                                 |
|---------------------------|---------------------------------------------------------------------------------|
| **File Upload**           | Users can upload `.pdf` and `.md` files via REST API.                          |
| **File Retrieval**        | Retrieve file metadata (path, name, size, type) using an `uploadId`.           |
| **File Replacement**      | Replace an existing file using the same `uploadId`.                            |
| **File Deletion**         | Delete a file by its `uploadId`.                                               |
| **MinIO Integration**     | Store files in a **MinIO S3-compatible** bucket for scalability.               |
| **PostgreSQL Metadata**  | Track file metadata (upload timestamp, size, type) in a structured database.    |
| **Dockerized Deployment** | Containerized deployment for easy scaling and deployment.                       |
| **Frontend UI**           | React-based UI for file uploads with drag-and-drop support.                     |
| **OpenAPI Documentation** | Auto-generated API specs for seamless integration.                              |

### **Out-of-Scope Items**
- Support for **non-PDF/MD file types** (e.g., images, videos).
- **User authentication** (assumes integration with an existing auth system).
- **File encryption at rest** (beyond MinIO’s native security).
- **Real-time collaboration** (e.g., live editing of `.md` files).
- **Mobile app support** (focus on web-based UI).

### **Key Assumptions**
- The service will be **integrated with a course management system** (e.g., StudyfAI).
- **MinIO and PostgreSQL** will be managed externally (Docker-based).
- **API consumers** will handle authentication separately.
- **File sizes** will not exceed **100MB** (adjustable via Multer config).

---

## **3. Business Requirements**

### **3.1 Functional Requirements**
| **ID** | **Requirement**                                                                 | **Priority** | **Description**                                                                                     |
|--------|-------------------------------------------------------------------------------|--------------|-----------------------------------------------------------------------------------------------------|
| FR-001 | **File Upload API**                                                        | High         | Allow users to upload `.pdf` and `.md` files via `POST /api/v1/upload`.                            |
| FR-002 | **File Retrieval API**                                                      | High         | Return file metadata (`uploadId`, `filePath`, `fileName`) via `GET /api/v1/files/{uploadId}`.       |
| FR-003 | **File Replacement API**                                                    | Medium       | Replace an existing file using `PUT /api/v1/files/{uploadId}`.                                    |
| FR-004 | **File Deletion API**                                                       | Medium       | Delete a file using `DELETE /api/v1/files/{uploadId}`.                                            |
| FR-005 | **UUID-Based File Identification**                                          | High         | Generate and return a **UUID** (`uploadId`) for each file upload.                                  |
| FR-006 | **MinIO Storage Integration**                                                | High         | Store files in a **MinIO bucket** with proper bucket naming and permissions.                        |
| FR-007 | **PostgreSQL Metadata Storage**                                              | High         | Track file metadata (timestamp, size, type) in a structured database.                             |
| FR-008 | **Frontend Upload UI**                                                      | High         | Provide a **React-based UI** with drag-and-drop file uploads.                                       |
| FR-009 | **OpenAPI Documentation**                                                    | Medium       | Auto-generate API specs for seamless integration with other services.                               |
| FR-010 | **Health Check Endpoint**                                                   | Low          | Expose `/health` endpoint for monitoring service status.                                            |

### **3.2 Non-Functional Requirements**
| **Category**          | **Requirement**                                                                 | **Details**                                                                                     |
|-----------------------|-------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------|
| **Performance**       | **Latency**                                                                 | < 2s response time for 95% of API calls.                                                      |
|                       | **Throughput**                                                              | Handle **1000+ concurrent uploads** without degradation.                                          |
| **Security**          | **Data Encryption**                                                          | Files encrypted at rest in MinIO.                                                              |
|                       | **Authentication**                                                           | Assumes integration with an existing auth system (e.g., JWT).                                    |
|                       | **Rate Limiting**                                                            | Prevent abuse via API rate limiting (e.g., 100 requests/minute).                                |
| **Reliability**       | **High Availability**                                                        | Deployed in a **Docker Swarm/Kubernetes** environment for redundancy.                           |
|                       | **Backup & Recovery**                                                        | Automated backups for MinIO bucket and PostgreSQL database.                                      |
| **Scalability**       | **Horizontal Scaling**                                                       | Support **auto-scaling** based on load (e.g., Kubernetes HPA).                                 |
| **Compatibility**     | **API Versioning**                                                          | Follow **semantic versioning** (`/api/v1/...`).                                                 |
| **Usability**         | **User-Friendly UI**                                                        | Intuitive drag-and-drop interface with **real-time feedback**.                                  |

### **3.3 User Stories**
| **User Type**       | **Story**                                                                                     | **Acceptance Criteria**                                                                          |
|---------------------|---------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------|
| **Course Admin**    | As a course admin, I want to upload study materials so that students can access them.         | ✅ Upload `.pdf`/`.md` files via UI/API.                                                    |
| **Student**         | As a student, I want to download uploaded materials so I can study offline.                   | ✅ Retrieve file paths via API and download files.                                             |
| **System Integrator** | As a system integrator, I want to replace outdated files without losing metadata.          | ✅ Replace files using `uploadId` while preserving metadata.                                    |
| **DevOps Engineer** | As a DevOps engineer, I want a scalable deployment so the service handles peak loads.       | ✅ Deploy in Docker with auto-scaling support.                                               |

---

## **4. Technical Architecture Overview**
### **4.1 High-Level System Architecture**
```
┌───────────────────────────────────────────────────────────────────────────────┐
│                                **Client (Frontend)**                          │
│  ┌─────────────┐    ┌─────────────┐    ┌───────────────────────────────────┐  │
│  │   Browser   │───▶│   React UI  │───▶│          Upload Service API         │  │
│  └─────────────┘    └─────────────┘    └───────────────────────────────────┘  │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
                                      ▲
                                      │
┌───────────────────────────────────────────────────────────────────────────────┐
│                                **Upload Service**                            │
│  ┌─────────────┐    ┌─────────────┐    ┌───────────────────────────────────┐  │
│  │  Express    │───▶│  MinIO      │───▶│  PostgreSQL (Metadata)          │  │
│  │  (API)      │    │  (Storage)  │    └───────────────────────────────────┘  │
│  └─────────────┘    └─────────────┘                                          │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

### **4.2 Technology Stack**
| **Component**       | **Technology**                          | **Purpose**                                                                 |
|---------------------|----------------------------------------|-----------------------------------------------------------------------------|
| **Backend**         | Node.js (Express)                     | REST API server for file operations.                                         |
| **Storage**         | MinIO (S3-compatible)                 | Scalable object storage for files.                                          |
| **Database**        | PostgreSQL                            | Stores file metadata (UUID, path, timestamp).                               |
| **Frontend**        | React (Vite + TailwindCSS)            | User interface for file uploads.                                              |
| **Containerization**| Docker + Docker Compose               | Isolated deployment of services.                                             |
| **ORM**            | None (Raw SQL)                        | Direct PostgreSQL queries for metadata management.                          |
| **API Docs**        | OpenAPI (Swagger)                     | Auto-generated API documentation.                                             |

### **4.3 Integration Points**
| **Integration**      | **Purpose**                                                                 | **Protocol**       |
|----------------------|-----------------------------------------------------------------------------|--------------------|
| **Course Management**| Notify course admins of new uploads.                                        | REST API           |
| **Auth Service**     | Validate user permissions (assumed external).                                | JWT/OAuth2         |
| **Monitoring**       | Log API calls and errors for debugging.                                     | Prometheus/Grafana |
| **CI/CD**           | Automated testing and deployment.                                           | GitHub Actions     |

---

## **5. User Personas & Use Cases**
### **5.1 Target Users**
| **Persona**         | **Role**               | **Key Responsibilities**                          | **Pain Points**                                                                 |
|---------------------|------------------------|--------------------------------------------------|--------------------------------------------------------------------------------|
| **Course Admin**    | Administrator          | Uploads study materials, manages course content. | Manual file management is time-consuming.                                        |
| **Student**         | Learner               | Downloads materials for offline study.           | Difficulty finding or accessing uploaded files.                                   |
| **DevOps Engineer** | Infrastructure Owner  | Ensures high availability and scalability.       | Complex deployment and monitoring.                                               |

### **5.2 Primary Use Cases**
#### **Use Case 1: File Upload**
**Actor:** Course Admin
**Precondition:** User is authenticated and has upload permissions.
**Steps:**
1. Admin navigates to **Upload UI** in the course portal.
2. Drags and drops a `.pdf` or `.md` file into the upload area.
3. System validates file type and uploads to MinIO.
4. System returns a **UUID (`uploadId`)** and stores metadata in PostgreSQL.
5. Admin receives confirmation (e.g., toast notification).

**Success Criteria:**
- File is stored securely in MinIO.
- Metadata is saved in PostgreSQL.
- `uploadId` is returned to the client.

#### **Use Case 2: File Retrieval**
**Actor:** Student
**Precondition:** File exists in the system with a valid `uploadId`.
**Steps:**
1. Student requests file metadata via `GET /api/v1/files/{uploadId}`.
2. System retrieves `filePath` from PostgreSQL.
3. Student downloads the file from MinIO using the returned path.

**Success Criteria:**
- File path is returned successfully.
- Student can download the file without errors.

#### **Use Case 3: File Replacement**
**Actor:** Course Admin
**Precondition:** File exists with a valid `uploadId`.
**Steps:**
1. Admin uploads a new version of the file (same `uploadId`).
2. System replaces the old file in MinIO and updates metadata.
3. System logs the replacement in PostgreSQL.

**Success Criteria:**
- Old file is overwritten in MinIO.
- Metadata is updated with new file details.

---

## **6. Success Criteria**
### **6.1 Key Performance Indicators (KPIs)**
| **Metric**               | **Target**                          | **Measurement Method**                          |
|--------------------------|-------------------------------------|------------------------------------------------|
| **API Response Time**    | < 2s for 95% of requests           | Load testing (k6/JMeter).                      |
| **Throughput**           | 1000+ concurrent uploads            | Dockerized benchmarking.                       |
| **Uptime**               | 99.9% availability                  | Prometheus monitoring.                         |
| **Error Rate**           | < 1% failed uploads                 | API logs analysis.                             |
| **Storage Cost**         | MinIO bucket usage < 10GB/month     | MinIO console dashboard.                       |

### **6.2 Acceptance Criteria**
| **Feature**               | **Acceptance Test**                                                                 |
|---------------------------|------------------------------------------------------------------------------------|
| **File Upload**           | ✅ Upload a `.pdf` file → Returns `uploadId`.                                     |
| **File Retrieval**        | ✅ Fetch metadata via `uploadId` → Returns valid `filePath`.                      |
| **File Replacement**      | ✅ Replace file → Old file is overwritten, new metadata is saved.                |
| **File Deletion**         | ✅ Delete file → File is removed from MinIO and PostgreSQL.                       |
| **Frontend UI**           | ✅ Drag-and-drop upload works → File is uploaded successfully.                    |
| **OpenAPI Docs**          | ✅ API specs are auto-generated and accessible at `/api/v1/docs`.                 |
| **Docker Deployment**    | ✅ Service starts in Docker → Health check returns `UP`.                          |

### **6.3 Business Value Metrics**
| **Metric**               | **Impact**                                                                       |
|--------------------------|---------------------------------------------------------------------------------|
| **Reduced Manual Work**  | Course admins save **2+ hours/week** on file management.                        |
| **Improved Accessibility** | Students can **download materials anytime**, anywhere.                           |
| **Scalability**          | Handles **peak loads** during exam seasons without downtime.                     |
| **Cost Efficiency**      | MinIO reduces cloud storage costs vs. traditional S3.                            |
| **Integration Readiness**| Seamless API integration with **existing systems** (e.g., LMS).                |

---

## **7. Implementation Timeline**
### **7.1 High-Level Milestones**
| **Phase**          | **Duration** | **Deliverables**                                                                 |
|---------------------|--------------|--------------------------------------------------------------------------------|
| **Discovery**       | 1 week       | BRD, architecture diagrams, user stories.                                      |
| **Backend Dev**     | 3 weeks      | Express API, MinIO/PostgreSQL integration, OpenAPI specs.                      |
| **Frontend Dev**    | 2 weeks      | React UI with drag-and-drop uploads.                                            |
| **Testing**         | 1 week       | Unit tests, integration tests, load testing.                                     |
| **Deployment**      | 1 week       | Dockerized deployment, CI/CD pipeline.                                          |
| **Go-Live**         | 1 day        | Soft launch with course admins.                                                 |

### **7.2 Dependencies**
| **Dependency**               | **Owner**          | **Timeline**       | **Risk**                          |
|------------------------------|--------------------|--------------------|-----------------------------------|
| **MinIO Cluster**            | DevOps Team        | Week 2             | Delay in MinIO setup → API failures. |
| **PostgreSQL Database**      | DB Admin           | Week 1             | Schema migration issues.            |
| **Auth Service Integration** | Security Team      | Week 3             | JWT validation delays.              |
| **CI/CD Pipeline**           | DevOps Engineer    | Week 4             | Deployment failures.               |

### **7.3 Risk Considerations**
| **Risk**                          | **Mitigation Strategy**                                                                 |
|-----------------------------------|---------------------------------------------------------------------------------------|
| **MinIO Bucket Permissions**      | Use IAM roles for least-privilege access.                                              |
| **Database Downtime**             | Implement read replicas for PostgreSQL.                                                  |
| **API Rate Limiting Bypass**      | Enforce rate limits via Express middleware.                                            |
| **Frontend-Backend Mismatch**     | Use OpenAPI for contract testing.                                                      |
| **File Corruption**               | Validate file integrity on upload (checksums).                                         |

---

## **8. Appendix**
### **8.1 Glossary**
| **Term**          | **Definition**                                                                 |
|-------------------|-----------------------------------------------------------------------------|
| **uploadId**      | A **UUID** uniquely identifying a file in the system.                       |
| **MinIO**         | Open-source S3-compatible object storage for scalable file storage.           |
| **PostgreSQL**    | Relational database for storing file metadata.                               |
| **Multer**        | Middleware for handling `multipart/form-data` file uploads in Express.        |
| **OpenAPI**       | Standard for documenting REST APIs (Swagger).                                |

### **8.2 Open Questions**
1. Should the service support **file previews** (e.g., PDF thumbnails)?
2. How should **file versioning** be handled (e.g., `uploadId-v2`)?
3. Should **user-specific permissions** be enforced (e.g., read-only for students)?
4. What is the **retention policy** for deleted files?

---
**Approvals:**
| **Role**          | **Name**       | **Signature** | **Date**       |
|--------------------|----------------|---------------|----------------|
| **Product Owner**  | [Name]         |               | [Date]         |
| **Tech Lead**      | [Name]         |               | [Date]         |
| **Stakeholder**    | [Name]         |               | [Date]         |

---
**End of Document**