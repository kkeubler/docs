---
title: OpenAPI Spezifikation
---
# Content Generation API

````
openapi: 3.0.3
info:
  title: Content-Gen-Service API
  description: |
    Service zur Generierung von H5P-Quiz-Paketen aus PDF-Dokumenten.
    
    Der Service stellt ein Micro-Frontend (MFE) bereit, das per Module Federation 
    in den Quiz-Service integriert wird. Die Kommunikation zwischen MFE und Parent 
    erfolgt über postMessage-Events.
    
    ## Integration
    
    ### Micro-Frontend Einbindung
    Das MFE wird über Module Federation eingebunden:
    ```javascript
    contentGen: "contentGen@https://content-gen.example.com/remoteEntry.js"
    ```
    
    ### Event-Kommunikation
    - `contentgen:ready` - MFE ist bereit
    - `contentgen:completed` - Quiz-Generierung abgeschlossen
    - `contentgen:error` - Fehler aufgetreten
  version: 1.4.2
  contact:
    name: Content-Gen Team
    email: support@content-gen.example.com

servers:
  - url: https://content-gen.example.com/api/v1
    description: Production Server
  - url: https://content-gen.staging.example.com/api/v1
    description: Staging Server

tags:
  - name: micro-frontend
    description: Micro-Frontend Assets und Integration
  - name: quiz-generation
    description: Quiz-Generierung aus PDFs
  - name: jobs
    description: Job-Status und -Verwaltung

paths:
  /remoteEntry.js:
    get:
      tags:
        - micro-frontend
      summary: Micro-Frontend Entry Point
      description: |
        Lädt das Module Federation Remote Entry für das Content-Gen MFE.
        Wird vom Quiz-Service dynamisch importiert.
      responses:
        '200':
          description: JavaScript Module Federation Entry
          content:
            application/javascript:
              schema:
                type: string
                example: |
                  var contentGen = ...

  /mfe/config:
    get:
      tags:
        - micro-frontend
      summary: MFE Konfiguration
      description: Liefert Konfigurationsdaten für das Micro-Frontend
      responses:
        '200':
          description: MFE Konfiguration
          content:
            application/json:
              schema:
                type: object
                properties:
                  version:
                    type: string
                    example: "1.4.2"
                  features:
                    type: object
                    properties:
                      pdfPreview:
                        type: boolean
                      bulkGeneration:
                        type: boolean
                  limits:
                    type: object
                    properties:
                      maxPdfsPerQuiz:
                        type: integer
                        example: 5
                      maxFileSizeMB:
                        type: integer
                        example: 50

  /quiz/generate/{courseId}:
    post:
      tags:
        - quiz-generation
      summary: Quiz-Generierung starten
      description: |
        Startet die asynchrone Generierung eines H5P-Quiz aus ausgewählten PDFs.
        Wird intern vom MFE aufgerufen, nachdem der Nutzer PDFs ausgewählt hat.
        Die courseId wird als Path-Parameter übergeben.
      security:
        - BearerAuth: []
      parameters:
        - name: courseId
          in: path
          required: true
          schema:
            type: string
          description: ID des Kurses, für den das Quiz generiert werden soll
          example: "course_abc123"
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - contentGenType
                - pdfIds
                - title
                - difficulty
              properties:
                contentGenType:
                  type: string
                  description: Typ der Content-Generierung
                  enum: [quiz]
                  example: "quiz"
                pdfIds:
                  type: array
                  description: Liste der zu verwendenden PDF-IDs
                  items:
                    type: string
                  minItems: 1
                  maxItems: 5
                  example: ["pdf_001", "pdf_002"]
                title:
                  type: string
                  description: Titel des Quiz
                  minLength: 3
                  maxLength: 200
                  example: "Einführung in XY"
                difficulty:
                  type: string
                  description: Schwierigkeitsgrad
                  enum: [easy, medium, hard]
                  example: "medium"
                options:
                  type: object
                  description: Optionale Generierungsparameter
                  properties:
                    questionCount:
                      type: integer
                      description: Gewünschte Anzahl Fragen
                      minimum: 5
                      maximum: 50
                      example: 18
                    language:
                      type: string
                      description: Sprache des Quiz
                      example: "de"
                    includeHints:
                      type: boolean
                      description: Hinweise zu Fragen generieren
                      default: true
      responses:
        '202':
          description: Generierung wurde gestartet
          content:
            application/json:
              schema:
                type: object
                required:
                  - jobId
                  - status
                  - estimatedCompletionSeconds
                properties:
                  jobId:
                    type: string
                    description: Job-ID für Status-Abfragen
                    example: "job_9a2d7c0b"
                  status:
                    type: string
                    enum: [queued, processing]
                    example: "queued"
                  estimatedCompletionSeconds:
                    type: integer
                    description: Geschätzte Verarbeitungszeit in Sekunden
                    example: 90
                  statusUri:
                    type: string
                    format: uri
                    description: URI zum Abfragen des Job-Status
                    example: "https://content-gen.example.com/api/v1/jobs/job_9a2d7c0b"
        '400':
          description: Ungültige Anfrage
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '401':
          description: Nicht authentifiziert
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        '422':
          description: PDFs konnten nicht verarbeitet werden
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /jobs/{jobId}:
    get:
      tags:
        - jobs
      summary: Job-Status abfragen
      description: |
        Ruft den aktuellen Status eines Generierungs-Jobs ab.
        Polling-Intervall: 2-5 Sekunden empfohlen.
      security:
        - BearerAuth: []
      parameters:
        - name: jobId
          in: path
          required: true
          schema:
            type: string
          description: Job-ID aus der generate-Response
          example: "job_9a2d7c0b"
      responses:
        '200':
          description: Job-Status
          content:
            application/json:
              schema:
                oneOf:
                  - $ref: '#/components/schemas/JobStatusProcessing'
                  - $ref: '#/components/schemas/JobStatusCompleted'
                  - $ref: '#/components/schemas/JobStatusFailed'
              examples:
                processing:
                  summary: Job wird verarbeitet
                  value:
                    jobId: "job_9a2d7c0b"
                    status: "processing"
                    progress: 45
                    currentStep: "Fragen werden generiert..."
                    startedAt: "2025-11-20T10:15:30Z"
                completed:
                  summary: Job abgeschlossen
                  value:
                    jobId: "job_9a2d7c0b"
                    status: "completed"
                    completedAt: "2025-11-20T10:16:57Z"
                    result:
                      quiz:
                        title: "Einführung in XY"
                        difficulty: "medium"
                        questionCount: 18
                      h5p:
                        packageUri: "https://cdn.contentgen.local/jobs/job_9a2d7c0b/out.h5p"
                        sizeBytes: 2482310
                        sha256: "8d3f...f1a"
                      meta:
                        processingTimeMs: 87432
                        generatorVersion: "1.4.2"
                failed:
                  summary: Job fehlgeschlagen
                  value:
                    jobId: "job_9a2d7c0b"
                    status: "failed"
                    error:
                      code: "PDF_PARSE_ERROR"
                      message: "PDF konnte nicht geparst werden"
                    failedAt: "2025-11-20T10:16:15Z"
        '404':
          description: Job nicht gefunden
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /jobs/{jobId}/cancel:
    post:
      tags:
        - jobs
      summary: Job abbrechen
      description: Bricht einen laufenden Generierungs-Job ab
      security:
        - BearerAuth: []
      parameters:
        - name: jobId
          in: path
          required: true
          schema:
            type: string
          example: "job_9a2d7c0b"
      responses:
        '200':
          description: Job wurde abgebrochen
          content:
            application/json:
              schema:
                type: object
                properties:
                  jobId:
                    type: string
                  status:
                    type: string
                    enum: [cancelled]
                  cancelledAt:
                    type: string
                    format: date-time
        '404':
          description: Job nicht gefunden
        '409':
          description: Job kann nicht mehr abgebrochen werden

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: |
        Service-zu-Service Authentifizierung mit OAuth2 Bearer Token.
        Der Quiz-Service muss ein gültiges Service-Token mitschicken.

  schemas:
    Error:
      type: object
      required:
        - code
        - message
      properties:
        code:
          type: string
          description: Maschinenlesbarer Error-Code
          example: "INVALID_PDF_SELECTION"
        message:
          type: string
          description: Menschenlesbare Fehlermeldung
          example: "Mindestens eine PDF muss ausgewählt werden"
        details:
          type: object
          description: Zusätzliche Fehlerdetails
          additionalProperties: true
        timestamp:
          type: string
          format: date-time
          example: "2025-11-20T10:15:30Z"

    JobStatusProcessing:
      type: object
      required:
        - jobId
        - status
      properties:
        jobId:
          type: string
          example: "job_9a2d7c0b"
        status:
          type: string
          enum: [queued, processing]
          example: "processing"
        progress:
          type: integer
          description: Fortschritt in Prozent (0-100)
          minimum: 0
          maximum: 100
          example: 45
        currentStep:
          type: string
          description: Aktueller Verarbeitungsschritt
          example: "Fragen werden generiert..."
        startedAt:
          type: string
          format: date-time
          example: "2025-11-20T10:15:30Z"
        estimatedCompletionSeconds:
          type: integer
          description: Verbleibende Zeit in Sekunden
          example: 45

    JobStatusCompleted:
      type: object
      required:
        - jobId
        - status
        - completedAt
        - result
      properties:
        jobId:
          type: string
          example: "job_9a2d7c0b"
        status:
          type: string
          enum: [completed]
          example: "completed"
        completedAt:
          type: string
          format: date-time
          example: "2025-11-20T10:16:57Z"
        result:
          type: object
          required:
            - quiz
            - h5p
            - meta
          properties:
            quiz:
              type: object
              description: Generierte Quiz-Metadaten
              required:
                - title
                - difficulty
                - questionCount
              properties:
                title:
                  type: string
                  example: "Einführung in XY"
                difficulty:
                  type: string
                  enum: [easy, medium, hard]
                  example: "medium"
                questionCount:
                  type: integer
                  example: 18
                topics:
                  type: array
                  description: Erkannte Themengebiete
                  items:
                    type: string
                  example: ["Grundlagen", "Konzepte"]
            h5p:
              type: object
              description: H5P-Paket Informationen
              required:
                - packageUri
                - sizeBytes
                - sha256
              properties:
                packageUri:
                  type: string
                  format: uri
                  description: Download-URL für das H5P-Paket
                  example: "https://cdn.contentgen.local/jobs/job_9a2d7c0b/out.h5p"
                sizeBytes:
                  type: integer
                  description: Dateigröße in Bytes
                  example: 2482310
                sha256:
                  type: string
                  description: SHA-256 Checksumme des Pakets
                  example: "8d3f...f1a"
                expiresAt:
                  type: string
                  format: date-time
                  description: Ablaufzeitpunkt der Download-URL
                  example: "2025-11-21T10:16:57Z"
            meta:
              type: object
              description: Verarbeitungs-Metadaten
              required:
                - processingTimeMs
                - generatorVersion
              properties:
                processingTimeMs:
                  type: integer
                  description: Verarbeitungszeit in Millisekunden
                  example: 87432
                generatorVersion:
                  type: string
                  description: Version des Generator-Modells
                  example: "1.4.2"
                sourceInfo:
                  type: object
                  properties:
                    pdfCount:
                      type: integer
                      example: 2
                    totalPages:
                      type: integer
                      example: 45

    JobStatusFailed:
      type: object
      required:
        - jobId
        - status
        - error
        - failedAt
      properties:
        jobId:
          type: string
          example: "job_9a2d7c0b"
        status:
          type: string
          enum: [failed]
          example: "failed"
        error:
          type: object
          required:
            - code
            - message
          properties:
            code:
              type: string
              description: Fehlercode
              enum:
                - PDF_PARSE_ERROR
                - CONTENT_EXTRACTION_FAILED
                - QUIZ_GENERATION_FAILED
                - H5P_PACKAGING_FAILED
                - TIMEOUT
              example: "PDF_PARSE_ERROR"
            message:
              type: string
              description: Fehlerbeschreibung
              example: "PDF konnte nicht geparst werden"
            details:
              type: object
              description: Zusätzliche Fehlerdetails
              additionalProperties: true
        failedAt:
          type: string
          format: date-time
          example: "2025-11-20T10:16:15Z"
        retryable:
          type: boolean
          description: Ob der Job wiederholt werden kann
          example: true

    PostMessageEvent:
      description: |
        PostMessage Events die vom MFE an den Parent gesendet werden.
        Format: `window.parent.postMessage(event, targetOrigin)`
      oneOf:
        - $ref: '#/components/schemas/ReadyEvent'
        - $ref: '#/components/schemas/CompletedEvent'
        - $ref: '#/components/schemas/ErrorEvent'

    ReadyEvent:
      type: object
      description: MFE ist geladen und bereit
      required:
        - type
      properties:
        type:
          type: string
          enum: [contentgen:ready]
          example: "contentgen:ready"

    CompletedEvent:
      type: object
      description: Quiz-Generierung abgeschlossen
      required:
        - type
        - payload
      properties:
        type:
          type: string
          enum: [contentgen:completed]
          example: "contentgen:completed"
        payload:
          allOf:
            - $ref: '#/components/schemas/JobStatusCompleted/properties/result'
            - type: object
              properties:
                jobId:
                  type: string
                  example: "job_9a2d7c0b"

    ErrorEvent:
      type: object
      description: Fehler im MFE oder bei der Generierung
      required:
        - type
        - payload
      properties:
        type:
          type: string
          enum: [contentgen:error]
          example: "contentgen:error"
        payload:
          type: object
          required:
            - code
            - message
          properties:
            code:
              type: string
              example: "GENERATION_FAILED"
            message:
              type: string
              example: "Quiz konnte nicht generiert werden"
            jobId:
              type: string
              description: Job-ID falls verfügbar
              example: "job_9a2d7c0b"

    # Schema für die erwartete Kurs-Service API
    CourseServicePDFResponse:
      type: object
      description: |
        Response-Format, das der Kurs-Service bereitstellen muss.
        Endpunkt: GET /api/v1/courses/{courseId}/pdfs
      required:
        - courseId
        - pdfs
      properties:
        courseId:
          type: string
          example: "course_abc123"
        pdfs:
          type: array
          items:
            type: object
            required:
              - pdfId
              - title
              - sourceUri
            properties:
              pdfId:
                type: string
                description: Stabile, eindeutige PDF-ID
                example: "pdf_001"
              title:
                type: string
                description: Titel/Name der PDF
                example: "Kapitel 1 - Einführung"
              sourceUri:
                type: string
                format: uri
                description: Direkter Storage-Pfad oder URL zur PDF
                example: "https://storage.internal/courses/abc123/pdfs/chapter1.pdf"
              pages:
                type: integer
                description: Anzahl Seiten (empfohlen)
                example: 23
              sizeBytes:
                type: integer
                description: Dateigröße in Bytes
                example: 1245678
              updatedAt:
                type: string
                format: date-time
                description: Letztes Änderungsdatum
                example: "2025-11-15T08:30:00Z"
              metadata:
                type: object
                description: Zusätzliche Metadaten
                properties:
                  language:
                    type: string
                    example: "de"
                  author:
                    type: string
                    example: "Prof. Dr. Müller"
````