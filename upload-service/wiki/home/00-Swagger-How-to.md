# Swagger & OpenAPI: How-To Guide

## What is OpenAPI?

OpenAPI (formerly known as Swagger) is a specification for building and documenting RESTful APIs. It provides a standard, language-agnostic interface that allows both humans and computers to discover and understand the capabilities of a service without requiring access to source code or documentation.

### Key Benefits:
- **Standardized API Documentation**: Clear, consistent API documentation
- **Interactive API Testing**: Built-in UI for testing endpoints
- **Code Generation**: Automatic generation of client SDKs and server stubs
- **API Design-First Approach**: Design APIs before implementation

## OpenAPI Specification Structure

A typical OpenAPI definition (in YAML or JSON) includes:

```yaml
openapi: 3.0.0
info:
  title: Sample API
  version: 1.0.0
  description: A simple API example
servers:
  - url: https://api.example.com/v1
paths:
  /users:
    get:
      summary: Get all users
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        email:
          type: string
```

## Swagger UI

Swagger UI is a tool that renders OpenAPI specifications as interactive API documentation.

### Viewing Your API Documentation:
1. **Online Editor**: Visit [editor.swagger.io](https://editor.swagger.io) and paste your OpenAPI spec
2. **Local Installation**: Use the Swagger UI Docker image or npm package
3. **Integrated**: Many frameworks include Swagger UI integration

## Using Swagger Codegen to Generate a Node.js Mock Server

Swagger Codegen is a powerful tool that generates server stubs, client libraries, and API documentation from an OpenAPI specification.

### Prerequisites

1. **Java Runtime Environment (JRE)**: Required to run swagger-codegen
2. **Node.js and npm**: Required to run the generated server

### Step 1: Install Swagger Codegen

```bash
wget https://repo1.maven.org/maven2/io/swagger/codegen/v3/swagger-codegen-cli/3.0.71/swagger-codegen-cli-3.0.71.jar -O swagger-codegen-cli.jar
```

### Step 2: Create Your OpenAPI Specification

Create a file named `api-spec.yaml`:

```yaml
openapi: 3.0.0
info:
  title: MoodleDuo API
  version: 1.0.0
  description: Sample API for demonstration
servers:
  - url: http://localhost:3000/api/v1
paths:
  /courses:
    get:
      summary: Get all courses
      operationId: getCourses
      responses:
        '200':
          description: List of courses
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Course'
    post:
      summary: Create a new course
      operationId: createCourse
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Course'
      responses:
        '201':
          description: Course created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Course'
  /courses/{courseId}:
    get:
      summary: Get course by ID
      operationId: getCourseById
      parameters:
        - name: courseId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Course details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Course'
        '404':
          description: Course not found
components:
  schemas:
    Course:
      type: object
      required:
        - id
        - name
      properties:
        id:
          type: string
        name:
          type: string
        description:
          type: string
        instructor:
          type: string
```

### Step 3: Generate the Node.js Server

**Using swagger-codegen-cli JAR:**
```bash
java -jar swagger-codegen-cli.jar generate \
  -i api-spec.yaml \
  -l nodejs-server \
  -o ./generated-server
```

### Step 4: Install Dependencies and Run the Server

```bash
cd generated-server
npm install
npm start
```

The server will start on `http://localhost:8080` (or the port specified in your spec).

### Step 5: Test Your Mock Server

Once running, you can:

1. **Access Swagger UI**: Navigate to `http://localhost:8080/docs`
2. **Test endpoints with curl**:
   ```bash
   curl -X GET http://localhost:8080/api/v1/courses
   ```
3. **Use Postman or any HTTP client** to interact with your API

### Step 6: Customize Mock Responses

The generated server creates stub implementations. To add custom mock data:

1. Navigate to the controller files (usually in `controllers/` or `api/`)
2. Edit the handler functions to return mock data:

```javascript
exports.getCourses = function(args, res, next) {
  var examples = {};
  examples['application/json'] = [
    {
      "id": "course-1",
      "name": "Introduction to Programming",
      "description": "Learn the basics of programming",
      "instructor": "John Doe"
    },
    {
      "id": "course-2",
      "name": "Advanced Algorithms",
      "description": "Deep dive into algorithms",
      "instructor": "Jane Smith"
    }
  ];
  
  if (Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  } else {
    res.end();
  }
}
```

## Best Practices

1. **Design First**: Create your OpenAPI spec before coding
2. **Version Control**: Keep your API specifications in version control
3. **Use $ref**: Reference common schemas to avoid duplication
4. **Add Examples**: Include example requests/responses for better documentation
5. **Validate**: Use tools like [Spectral](https://stoplight.io/open-source/spectral) to lint your specs
6. **Keep it Updated**: Update the spec whenever API changes are made

## Useful Tools

- **Swagger Editor**: [editor.swagger.io](https://editor.swagger.io)
- **OpenAPI Generator**: [openapi-generator.tech](https://openapi-generator.tech)
- **Swagger Codegen**: [swagger.io/tools/swagger-codegen](https://swagger.io/tools/swagger-codegen/)
- **Postman**: Import OpenAPI specs directly
- **Stoplight Studio**: Visual OpenAPI editor

## Resources

- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
- [Swagger Documentation](https://swagger.io/docs/)