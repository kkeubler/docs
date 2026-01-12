# Microservice Deployment Guide

This guide explains how to deploy a new microservice to the Kubernetes cluster. We'll use the `example-service` as a reference.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step 1: Create Your Service Directory](#step-1-create-your-service-directory)
4. [Step 2: Create the Dockerfile](#step-2-create-the-dockerfile)
5. [Step 3: Optional - Docker Compose for Local Development](#step-3-optional---docker-compose-for-local-development)
6. [Step 4: Configure GitLab CI for Automatic Builds](#step-4-configure-gitlab-ci-for-automatic-builds)
7. [Step 5: Add Kubernetes Manifests](#step-5-add-kubernetes-manifests)
8. [Step 6: Deploy and Verify](#step-6-deploy-and-verify)

---

## Overview

### Development Workflow

The development and deployment workflow follows GitLab Flow:

```
Feature Branch → Pull Request → Code Review → Merge to Main → CI Build → Registry → Flux CD → Kubernetes
```

1. **Create a feature branch** from `main` for your changes
2. **Develop and test locally** using Docker (Compose)
3. **Open a Pull Request (PR)** to merge into `main`
4. **Code review** - at least one approval is required
5. **Merge to main** - triggers the CI/CD pipeline
6. **GitLab CI** builds and pushes Docker images to the container registry
7. **Flux CD** watches the `clusters/` folder and applies changes to Kubernetes
8. **Kustomize** manages environment-specific configurations (development/production)

### Branch Strategy

| Branch | Purpose | CI/CD Trigger |
|--------|---------|---------------|
| `feature/<team>/<feature>` | Development work (e.g., `feature/dashboard-team/add-charts`) | No build |
| `main` | Integration branch | Builds & deploys to dev |
| `tags` | Production releases | Builds & deploys to prod |

---

## Prerequisites

- Access to the GitLab repository
- Docker installed locally (for testing)
- Basic understanding of Docker and Kubernetes
- Your microservice code ready for containerization

---

## Step 1: Create Your Service Directory

Create a new directory for your service under `services/`:

```bash
mkdir -p services/my-service/src
```

Your directory structure should look like:

```
services/
└── my-service/
    ├── Dockerfile
    ├── requirements.txt  # or package.json, go.mod, etc.
    └── src/
        └── main.py       # or your main application file
```

---

## Step 2: Create the Dockerfile

Create a `Dockerfile` in your service directory. Here's the example from `example-service`:

```dockerfile
# Use Python 3.14 slim image as base
FROM python:3.14-slim

# Set working directory in container
WORKDIR /src

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY src/ ./src/

# Set environment variables with defaults
ENV HOST=0.0.0.0
ENV PORT=8000

# Command to run the application
CMD uvicorn src.main:app --host ${HOST} --port ${PORT}
```

### Dockerfile Best Practices

1. **Use slim/alpine images** to reduce image size
2. **Copy dependency files first** to leverage Docker layer caching
3. **Use environment variables** for configuration
4. **Expose the correct port** your application listens on
5. **Use non-root users** for security (recommended)

### Examples for Other Languages

<details>
<summary>Node.js Example</summary>

```dockerfile
FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src/ ./src/

ENV PORT=3000
EXPOSE 3000

CMD ["node", "src/index.js"]
```
</details>

<details>
<summary>Go Example</summary>

```dockerfile
# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/api

# Runtime stage
FROM alpine:latest

WORKDIR /app
COPY --from=builder /app/main .

ENV PORT=8080
EXPOSE 8080

CMD ["./main"]
```
</details>

<details>
<summary>Java/Kotlin (Gradle) Example</summary>

```dockerfile
FROM gradle:8-jdk21 AS builder

WORKDIR /app
COPY . .
RUN gradle build --no-daemon

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar

ENV PORT=8080
EXPOSE 8080

CMD ["java", "-jar", "app.jar"]
```
</details>

---

## Step 3: Optional - Docker Compose for Local Development

Create a `docker-compose.yml` (or `compose.dev.yml`) for local development:

```yaml
version: '3.8'

services:
  my-service:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - HOST=0.0.0.0
      - PORT=8000
      # Add other environment variables here
    volumes:
      # Mount source for hot-reloading during development
      - ./src:/src/src:ro
    # Optional: Add dependencies
    depends_on:
      - database

  # Optional: Add supporting services
  database:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: mypassword
      POSTGRES_DB: mydb
    ports:
      - "5432:5432"
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
```

### Local Development Commands

```bash
# Build and start the service
docker-compose -f compose.dev.yml up --build

# Run in detached mode
docker-compose -f compose.dev.yml up -d --build

# View logs
docker-compose -f compose.dev.yml logs -f

# Stop and remove containers
docker-compose -f compose.dev.yml down

# Remove volumes as well
docker-compose -f compose.dev.yml down -v
```

---

## Step 4: Configure GitLab CI for Automatic Builds

Edit the `.gitlab-ci.yml` file in the repository root to add your service's build jobs.

### Add Your Build Jobs

You need to add **two jobs** for each service to `.gitlab-ci.yml`:

1. **Build-only job for merge requests** - validates that the Docker image builds correctly
2. **Build-and-push job for main branch** - builds and pushes images to the registry

```yaml
# Build-only my-service for merge requests (validation)
build-mr:my-service:
  <<: *build-mr-template
  variables:
    SERVICE_NAME: <SERVICE_NAME> # my-service
  only:
    changes:
      - services/<SERVICE_NAME>/**/* # services/my-service/**/*
      - .gitlab-ci.yml
    refs:
      - merge_requests

# Build and push my-service Docker image using Kaniko
build:my-service:
  <<: *build-service-template
  variables:
    SERVICE_NAME: <SERVICE_NAME> # my-service
  only:
    changes:
      - services/<SERVICE_NAME>/**/* # services/my-service/**/*
      - .gitlab-ci.yml
    refs:
      - main
      - tags
```

### How It Works

The CI/CD pipeline uses two different templates depending on the branch:

#### Build-Only Template (`build-mr-template`) - For Merge Requests

Used when you create a pull request. This template:

1. Uses **Kaniko** to build Docker images (no Docker daemon required)
2. **Does NOT push** images to the registry (uses `--no-push` flag)
3. Validates that your Dockerfile builds successfully
4. Helps catch build errors early in the development process
5. Only triggers on merge requests when service files change

**Purpose:** Fast feedback on whether your Docker image will build before merging to main.

#### Build-and-Push Template (`build-service-template`) - For Main Branch

Used when a pull request is merged to `main`. This template:

1. Uses **Kaniko** to build Docker images (no Docker daemon required)
2. **Pushes to the registry** with multiple tags:
   - `latest` - always points to the most recent build
   - `${CI_COMMIT_SHORT_SHA}` - commit hash for traceability
   - `${CI_COMMIT_REF_NAME}-${CI_PIPELINE_ID}` - branch/tag + pipeline ID
3. Only triggers on changes to your service directory or the CI file
4. Runs only on `main` branch and tags

**Purpose:** Build and publish production-ready images after code review.

### Registry Path

Your images will be available at:
```
registry.mi.hdm-stuttgart.de/aidrivensoftwaredev/semester/ws2526/moodleduo/my-service:latest
```

---

## Step 5: Add Kubernetes Manifests

Create the Kustomize structure for your service in the `clusters/aisoftware/services/` directory.

### 5.1 Create Base Configuration

Create the base directory and files:

```bash
mkdir -p clusters/aisoftware/services/base/my-service
```

#### `clusters/aisoftware/services/base/my-service/deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-service-api
spec:
  replicas: 1  # Will be overridden per environment
  selector:
    matchLabels:
      app: my-service-api
  template:
    metadata:
      labels:
        app: my-service-api
    spec:
      imagePullSecrets:
      - name: studyfai-container-registry
      containers:
      - name: my-service-api
        image: registry.mi.hdm-stuttgart.de/aidrivensoftwaredev/semester/ws2526/moodleduo/my-service:latest
        ports:
        - containerPort: 8000  # Match your application port
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "500m"
        # Optional: Add environment variables
        env:
        - name: PORT
          value: "8000"
        # Optional: Add health checks
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 10
```

#### `clusters/aisoftware/services/base/my-service/service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service-api
spec:
  selector:
    app: my-service-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8000  # Match your container port
  type: ClusterIP
```

#### `clusters/aisoftware/services/base/my-service/ingress.yaml`
In the following template you have to change the "\<some value\>" values to match your service. 
If you need to use another match rule [see here](https://doc.traefik.io/traefik/reference/routing-configuration/http/routing/rules-and-priority/) for allowed traefik rules. 
The referenced documentation explains rule priorities as well, which might be a problem source if now packages are redirected to your service.
For troubleshooting 
 TODO: Erklärung welche abänderbaren Felder was machen, hinweis dazu in ADR, Was ist ein Ingress in diesem manual
```yaml
apiVersion: traefik.io/v1alpha1
kind: IngressRoute
metadata:
  name: <your service name>
spec:
  entryPoints:
    - websecure 
  routes:
    - match: PathPrefix(`<your service prefix>`)
      kind: Rule
      middlewares:
        - name: <auth-chain/jwt-auth/(or remove middlewares object completely)>  # Service-specific authentication
      services:
        - name: <name of your k8s service>
          port: <port of that service>
  tls:
    secretName: studyfai-de-tls
```

#### `clusters/aisoftware/services/base/my-service/kustomization.yaml`

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - deployment.yaml
  - service.yaml
  - ingress.yaml
```

### 5.2 Create Development Environment Configuration

```bash
mkdir -p clusters/aisoftware/services/development/my-service
```

#### `clusters/aisoftware/services/development/my-service/kustomization.yaml`

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: studyfai-development
resources:
  - ../../base/my-service
patches:
  - patch: |-
      apiVersion: apps/v1
      kind: Deployment
      metadata:
        name: my-service-api
      spec:
        replicas: 1
    target:
      kind: Deployment
      name: my-service-api
images:
  - name: registry.mi.hdm-stuttgart.de/aidrivensoftwaredev/semester/ws2526/moodleduo/my-service
    newTag: latest  # Always latest in dev
```

### 5.3 Create Production Environment Configuration

```bash
mkdir -p clusters/aisoftware/services/production/my-service
```

#### `clusters/aisoftware/services/production/my-service/kustomization.yaml`

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
namespace: studyfai-production
resources:
  - ../../base/my-service
patches:
  - patch: |-
      apiVersion: apps/v1
      kind: Deployment
      metadata:
        name: my-service-api
      spec:
        replicas: 3
    target:
      kind: Deployment
      name: my-service-api
images:
  - name: registry.mi.hdm-stuttgart.de/aidrivensoftwaredev/semester/ws2526/moodleduo/my-service
    newTag: v1.0.0  # Use specific version tags for production
```

### 5.4 Register Your Service in Environment Kustomizations

Add your service to the environment kustomization files:

#### Update `clusters/aisoftware/services/development/kustomization.yaml`

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - namespace.yaml
  - example-service
  - my-service  # Add this line
```

#### Update `clusters/aisoftware/services/production/kustomization.yaml`

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - namespace.yaml
  - example-service
  - my-service  # Add this line
```

---

## Step 6: Deploy and Verify

### 6.1 Create a Feature Branch

Branch naming convention: `feature/<TEAM_NAME>/<FEATURE>`

Examples:
- `feature/dashboard-team/add-charts`
- `feature/user-team/oauth-integration`
- `feature/course-team/add-my-service`

```bash
# Create and switch to a new feature branch
git checkout -b feature/my-team/add-my-service

# Make your changes (Dockerfile, K8s manifests, CI config)
git add .
git commit -m "feat: add my-service deployment configuration"

# Push the feature branch
git push origin feature/my-team/add-my-service
```

### 6.2 Open a Pull Request

1. Go to GitLab → Repository → Branches
2. Click **"Create merge request"** next to your feature branch
3. Fill in the merge request details:
   - **Title**: `feat: add my-service deployment configuration`
   - **Description**: Describe what your service does and any configuration details
   - **Assignee**: Assign yourself
   - **Reviewer**: Add at least one team member for code review

### 6.3 Code Review Process

1. Wait for the reviewer to approve your changes
2. Address any feedback by pushing additional commits to your feature branch
3. Once approved, the merge request can be merged

### 6.4 Merge and Deploy

1. Click **"Merge"** in the merge request (or use "Merge when pipeline succeeds")
2. The merge to `main` triggers the GitLab CI pipeline
3. Monitor the pipeline:
   - Go to GitLab → CI/CD → Pipelines
   - Watch the `build:my-service` job complete
   - Verify the image is pushed to the registry

### 6.5 Verify Deployment (To be done by the Platform Team)

Flux CD will automatically detect changes and apply them. To verify:

```bash
# Check deployments
kubectl get deployments -n studyfai-development

# Check pods
kubectl get pods -n studyfai-development

# Check services
kubectl get services -n studyfai-development

# Check pod logs
kubectl logs -f deployment/my-service-api -n studyfai-development
```


## Complete File Structure Reference

After completing all steps, your file structure should look like:

```
moodleduo/
├── .gitlab-ci.yml                    # Updated with your build job
├── services/
│   └── my-service/
│       ├── Dockerfile
│       ├── compose.dev.yml           # Optional
│       ├── requirements.txt          # Or package.json, go.mod, etc.
│       └── src/
│           └── main.py
└── clusters/
    └── aisoftware/
        └── services/
            ├── base/
            │   └── my-service/
            │       ├── deployment.yaml
            │       ├── service.yaml
            │       └── kustomization.yaml
            ├── development/
            │   ├── kustomization.yaml  # Updated to include my-service
            │   └── my-service/
            │       └── kustomization.yaml
            └── production/
                ├── kustomization.yaml  # Updated to include my-service
                └── my-service/
                    └── kustomization.yaml
```

---

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Kustomize Documentation](https://kustomize.io/)
- [Flux CD Documentation](https://fluxcd.io/docs/)
- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)
