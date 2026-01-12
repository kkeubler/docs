# Beschreibung
Der Service bietet die Möglichkeit, eine Datei (PDF oder Markdown) hochzuladen, welche dann im Kurs zu sehen ist.
Der Upload erfolgt in einem Kurs und ist nur für Nutzer mit entsprechender Berechtigung möglich.
Die Dateien können hochgeladen, ersetzt und gelöscht werden.
Der Kurs prüft, ob ein Nutzer berechtigt ist, eine Datei hochzuladen/zu erstetzen/zu löschen. 
Der Upload gibt die Datei weiter an den Course-Service mit der UUID der Datei.
Bei Upload einer Datei wird in der Response vom Upload-Service die zugewiesene UUID der Datei mitgeliefert. Für alle weiteren Vorgänge, wie herunterladen, ersetzen, löschen erwarten wir die uploadID der Datei.


Daten der Datei:
- uploadId: string (uuid)
- filePath: string
- fileName: string
- fileSize: integer
- fileType: string
- uploadTimestamp: string (date-time)

# Anforderungen

# APIs
## Eingehend (Was wir konsumieren)
- **Course-Service:** UUID der Datei (die bspw. heruntergeladen/gelöscht werden soll)

## Ausgehend (Was wir anbieten)
- **GET** /uploads/path/{uploadId} : Liefert den Pfad, zum Speicherort der Datei
```yaml
openapi: 3.0.3
info:
  title: File Upload Service API
  description: |
    Service für das Hochladen, Ersetzen und Löschen von Dateien (PDF oder Markdown).
    Jede Datei wird durch eine UUID identifiziert, die beim Upload zurückgegeben wird.
    Die Berechtigungsprüfung erfolgt auf Kursebene durch den aufrufenden Service.
  version: 1.0.0
paths:
  /files:
    post:
      summary: Datei hochladen
      description: |
        Lädt eine neue Datei (PDF oder Markdown) hoch und gibt die UUID zurück.
        Der aufrufende Service (z.B. Course-Service) ist für die Berechtigungsprüfung verantwortlich.
      operationId: uploadFile
      tags:
        - Files
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              required:
paths:
  /api/v1/upload:
    post:
      tags:
        - Uploads
      summary: Upload einer Datei (vom Kurs-Service initiiert)
      description: Nimmt eine Datei entgegen, speichert sie und gibt die
        Upload-ID zurück.
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
          description: Datei erfolgreich hochgeladen
          content:
            application/json:
              schema:
                type: object
                properties:
                  uploadId:
                    type: string
                    format: uuid
                    example: "550e8400-e29b-41d4-a716-446655440000"
        '400':
          description: Ungültige Anfrage oder fehlende Parameter
        '500':
          description: Interner Serverfehler beim Upload



  /files/{uuid}:
    get:
      summary: Datei herunterladen
      description: Lädt die Datei mit der angegebenen UUID herunter
      operationId: getFile
      tags:
        - Files
      parameters:
        - $ref: '#/components/parameters/UuidParam'
      responses:
        '200':
          description: Datei erfolgreich abgerufen
          content:
            application/octet-stream:
              schema:
                type: string
                format: binary
            application/pdf:
              schema:
                type: string
                format: binary
            text/markdown:
              schema:
                type: string
                format: binary
        '401':
          $ref: '#/components/responses/Unauthorized'
        '404':
          $ref: '#/components/responses/NotFound'
        '500':
          $ref: '#/components/responses/InternalServerError'
    
    put:
      summary: Datei ersetzen
      description: |
        Ersetzt eine bestehende Datei durch eine neue Version.
        Die UUID bleibt dabei unverändert.
      operationId: updateFile
      tags:
        - Files
      parameters:
        - $ref: '#/components/parameters/UuidParam'
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              required:
                - file
              properties:
                file:
                  type: string
                  format: binary
                  description: Die neue Datei zum Ersetzen
      responses:
        '200':
          description: Datei erfolgreich ersetzt
          content:
            application/json:
              schema:
                type: object
                properties:
                  uuid:
                    type: string
                    format: uuid
                    description: UUID der aktualisierten Datei
                    example: "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
        '400':
          $ref: '#/components/responses/BadRequest'
        '404':
          $ref: '#/components/responses/NotFound'
        '500':
          $ref: '#/components/responses/InternalServerError'
  delete:
      summary: Datei löschen
      description: Löscht die Datei mit der angegebenen UUID
      operationId: deleteFile
      tags:
        - Files
      parameters:
        - $ref: '#/components/parameters/UuidParam'
      responses:
        '204':
          description: Datei erfolgreich gelöscht
        '401':
          $ref: '#/components/responses/Unauthorized'
        '404':
          $ref: '#/components/responses/NotFound'
        '500':
          $ref: '#/components/responses/InternalServerError'
```