# Retrieve User information
We need the ability to retrieve the following information about a User by Id:
- Username
- Profile Picture
- Usertype (e.g. Admin, Student, Instructor/Lecturer)

## Proposal 1
```yaml
openapi: 3.0.3
info:
  title: User Service API
  version: 1.0.0
  description: API for retrieving user information by ID.
paths:
  /users/{id}:
    get:
      summary: Get user by ID
      description: Retrieve information about a user by their unique ID.
      parameters:
        - name: id
          in: path
          required: true
          description: The unique identifier of the user.
          schema:
            type: string
      responses:
        '200':
          description: Successful retrieval of user information.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '404':
          description: User not found.
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
    User:
      type: object
      required:
        - id
        - username
        - profilePicture
        - userType
      properties:
        id:
          type: string
          example: "46971196-b704-4cc5-aef4-de8e0e603648"
        username:
          type: string
          example: "john_doe"
        profilePicture:
          type: string
          format: uri
          example: "https://cdn.example.com/profiles/12345.jpg"
        userType:
          type: string
          enum:
            - Admin
            - Student
            - Lecturer
          example: "Student"
    Error:
      type: object
      properties:
        code:
          type: integer
          example: 404
        message:
          type: string
          example: "User not found"
```

# Link to User Profile Page
We need the ability to link out to a Users profile page

## Proposal
```
https://moodleduo.com/user/:id
```