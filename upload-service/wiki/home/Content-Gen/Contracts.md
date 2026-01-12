### Retrieve all PDFs for a Course

We need the ability to retrieve all PDF files uploaded to a given Course, so that the Content Generation Service can process them (e.g. generate quizzes, summaries, or flashcards). @kk172

```
openapi: 3.0.3
info:
  title: Course Service API
  version: 1.0.0
  description: API for retrieving all PDFs associated with a specific course.
paths:
  /courses/{courseId}/pdfs:
    get:
      summary: Get all PDFs for a course
      description: Retrieve a list of all PDF documents uploaded to the specified course.
      parameters:
        - name: courseId
          in: path
          required: true
          description: The unique identifier of the course.
          schema:
            type: string
      responses:
        '200':
          description: Successful retrieval of all PDFs for the course.
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/PdfFile'
        '404':
          description: Course not found or no PDFs available.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '500':
          description: Internal server error.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
components:
  schemas:
    PdfFile:
      type: object
      required:
        - courseId
        - fileName
        - fileUrl
      optional:
        - uploadedAt
      properties:
        id:
          type: string
          example: "7e28d5fc-72b9-44e0-b0f3-3b177e11f146"
        courseId:
          type: string
          example: "46971196-b704-4cc5-aef4-de8e0e603648"
        fileName:
          type: string
          example: "lecture_3_chapter_2.pdf"
        fileUrl:
          type: string
          format: uri
          example: "https://cdn.example.com/courses/46971196-b704-4cc5-aef4-de8e0e603648/lecture_3_chapter_2.pdf"
        uploadedAt:
          type: string
          format: date-time
          example: "2025-11-11T10:15:30Z"
    Error:
      type: object
      properties:
        code:
          type: integer
          example: 404
        message:
          type: string
          example: "No PDFs found for this course."
```