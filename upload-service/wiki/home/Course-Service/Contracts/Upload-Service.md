# CRUD operations for files

We need the ability to create, retrive, update, delete files

## Proposal:

```yaml
openapi: 3.0.3
info:
  title: File Upload Service API
  version: 1.0.0
  description: |
    A service that allows clients to Create, Read, Update, and Delete files.
    Each file will be identified by a UUID returned upon creation.
paths:
  /files:
    post:
      summary: Upload a new file
      operationId: uploadFile
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
              required:
                - file
      responses:
        '201':
          description: File uploaded successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  uuid:
                    type: string
                    format: uuid
                    description: Unique identifier for the uploaded file
  /files/{uuid}:
    get:
      summary: Download a file
      operationId: getFile
      parameters:
        - name: uuid
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: File retrieved successfully
          content:
            application/octet-stream:
              schema:
                type: string
                format: binary
        '404':
          description: File not found
    put:
      summary: Replace an existing file
      operationId: updateFile
      parameters:
        - name: uuid
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
              required:
                - file
      responses:
        '200':
          description: File updated successfully
        '404':
          description: File not found
    delete:
      summary: Delete a file
      operationId: deleteFile
      parameters:
        - name: uuid
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '204':
          description: File deleted successfully
        '404':
          description: File not found
components:
  schemas:
    FileUUID:
      type: string
      format: uuid
      example: 123e4567-e89b-12d3-a456-426614174000
```