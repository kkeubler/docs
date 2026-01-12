# Prompts

### Initial planning phase - Gemini vs. ChatGPT

You are a software developer working in a micro service environment. Your task is to develop the notification service of a learning platform similar to moodle. More specifically the backend and the frontend. What technologies would you want to use? They should be easy to understand. The only important thing is the communication with other services, which will happen over the Open API with http (rest api). We do not want any code yet, it is only the initial planning phase and our preferred language is python. Does that work?

## Results

* Backend Framework: FastAPI, Python
* If needed database: PostgresSQL
* Docker compose, Rancher & Kubernetes for production environment
* Mail: SMTP - smtplib
* Frontend Framework: React, TypeScript
  * HTTP-Client: Axios

### Starting development phase

You are a software developer working in a micro service environment. Your task is to develop the notification service of a learning platform similar to moodle. The communication will happen over the Open API with http (rest api). We are using the following technologies:

* Backend Framework: FastAPI, Python
* If needed database: PostgresSQL
* Docker compose, Rancher & Kubernetes for production environment
* Mail: SMTP - smtplib
* Frontend Framework: React, TypeScript
  * HTTP-Client: Axios

We are a team of three developers. How do we approach the implementation of the notification service? Write a short step by step instruction? E.g download docker, set up docker compose and everything else.

### Results

## Komplizierte Version

## 🚀 Ein 5-Phasen-Implementierungsplan

Dieser Plan priorisiert den **API-First-Ansatz** und teilt die Arbeit klar zwischen Backend und Frontend auf.

### Phase 1: Der Vertrag (API-First & Basis-Setup)

Der wichtigste Schritt zuerst: Alle müssen sich auf die Schnittstelle einigen.

1. **Alle Entwickler (Team-Aufgabe):**
   * **OpenAPI-Spezifikation definieren:** Setzt euch zusammen und schreibt die `openapi.yaml`-Datei. Was sind die Endpunkte?
     * `POST /v1/notifications` (Nimmt einen Auftrag an, z.B. "Sende 'Neue Aufgabe' an User X").
     * `GET /v1/users/{user_id}/preferences` (Welche Benachrichtigungen will der User?).
     * `PUT /v1/users/{user_id}/preferences` (User ändert seine Einstellungen).
     * `GET /v1/users/{user_id}/history` (Welche Benachrichtigungen hat der User erhalten?).
   * **Tools installieren:** Stellt sicher, dass alle Docker Desktop, Python (mit `pip`), Node.js (mit `npm`/`yarn`) und Git installiert haben.
   * **Repo-Setup:** Erstellt ein Git-Repository (z.B. ein Monorepo mit `/backend` und `/frontend` Ordnern).

### Phase 2: Backend-Basis (API & Datenbank)

Ein Entwickler (oder zwei) legt die Grundlage für das Backend.

1. **FastAPI-Projekt initialisieren:**
   * Richtet die virtuelle Umgebung (`venv`) und die `requirements.txt` (mit `fastapi`, `uvicorn`, `sqlalchemy`, `psycopg2-binary`) ein.
2. **Datenbank-Modelle erstellen:**
   * Definiert die **SQLAlchemy-Modelle** (in `/models.py`) für die PostgreSQL-Datenbank (z.B. Tabellen für `UserPreferences` und `NotificationLog`).
3. **API-Endpunkte (Stubs) erstellen:**
   * Erstellt die FastAPI-Endpunkte basierend auf der `openapi.yaml`. Nutzt **Pydantic-Modelle** für die Request- und Response-Validierung (diese sollten 1:1 zu euren OpenAPI-Schemas passen).
   * _Tipp:_ FastAPI generiert automatisch eine `/docs` (Swagger) Seite aus eurem Code. Gleicht diese ständig mit eurer `openapi.yaml` ab.
4. **Docker Compose (Entwicklung) einrichten:**
   * Erstellt die `docker-compose.yml` im Stammverzeichnis.
   * Definiert die Services:
     * `backend`: Baut das FastAPI-Image (basierend auf einem `Dockerfile`).
     * `db`: Nutzt ein offizielles `postgres:15` Image.
     * `frontend`: (Kommt in Phase 4 hinzu).

### Phase 3: Asynchrone Worker (Kritischer Schritt!)

Ein Notification Service darf **niemals** E-Mails synchron beim API-Aufruf versenden (das blockiert den Aufrufer).

1. **Tech-Stack erweitern (Empfehlung):**
   * Fügt **Celery** (Task-Queue) und **Redis** (Broker) zu eurem Stack hinzu. Redis kann einfach als weiterer Service in `docker-compose.yml` hinzugefügt werden.
2. **Workflow implementieren:**
   * Wenn `POST /v1/notifications` aufgerufen wird, tut der Endpunkt nur eines: Die Anfrage validieren und einen Task in die **Celery-Queue** (via Redis) pushen. Er antwortet sofort mit `202 Accepted`.
3. **Den Worker erstellen:**
   * Implementiert den **Celery-Worker**. Dies ist ein separater Python-Prozess (läuft in einem eigenen Docker-Container).
   * Der Worker holt Tasks aus der Queue und nutzt **`smtplib`**, um die E-Mail _tatsächlich_ zu versenden.
   * Der Worker aktualisiert die `NotificationLog`-Tabelle in PostgreSQL (Status: `SENT` oder `FAILED`).

### Phase 4: Frontend-Implementierung (UI & Integration)

Parallel zu Phase 2 und 3 kann das Frontend-Team (basierend auf der `openapi.yaml`) starten.

1. **React-Projekt initialisieren:**
   * Richtet das React-Projekt mit TypeScript ein (z.B. mit `Vite`).
2. **API-Client generieren (WICHTIG):**
   * Nutzt die `openapi.yaml` und ein Tool wie `openapi-typescript-codegen`, um automatisch den **Axios-Client** und alle **TypeScript-Interfaces** zu generieren.
   * _Vorteil:_ Wenn das Backend die API ändert, schlägt die Codegenerierung oder der TypeScript-Compiler im Frontend fehl. Ihr bemerkt API-Brüche sofort.
3. **UI-Komponenten bauen:**
   * Erstellt die React-Komponenten (z.B. `<NotificationSettings />`), die den generierten Client zum Lesen (`GET`) und Schreiben (`PUT`) der Präferenzen verwenden.
4. **Docker Compose (Frontend) aktualisieren:**
   * Fügt den `frontend`-Service zur `docker-compose.yml` hinzu (mit Hot-Reloading für die Entwicklung).

### Phase 5: Testing, CI/CD & Deployment

1. **Testing:**
   * Backend: Schreibt **Pytest**-Tests für eure API-Endpunkte und die Worker-Logik.
   * Frontend: Schreibt Unit-Tests (z.B. mit `Vitest` / `React Testing Library`).
2. **Produktions-Dockerfiles:**
   * Erstellt optimierte, mehrstufige `Dockerfile`s für die Produktion (Backend und Frontend).
3. **CI/CD & Deployment:**
   * Richtet eine Pipeline (z.B. GitHub Actions, GitLab CI) ein, die:
     1. Tests ausführt.
     2. Docker-Images baut und in eine Registry pusht.
     3. Die Kubernetes-Manifeste (Deployments, Services) auf **Rancher** anwendet, um die neuen Images auszurollen.

---

## 🧑‍🤝‍🧑 Aufgabenverteilung im 3er-Team (Vorschlag)

* **Entwickler A (Backend/API-Lead):**
  * Besitzt die `openapi.yaml`.
  * Richtet FastAPI, Docker Compose (Basis) und die PostgreSQL-Datenbank (SQLAlchemy-Modelle) ein.
  * Implementiert die Endpunkte für `UserPreferences` (`GET`/`PUT`).
* **Entwickler B (Backend/Worker-Lead):**
  * Richtet Celery, Redis und den `smtplib`-Mailversand ein.
  * Implementiert den `POST /v1/notifications`-Endpunkt (der nur in die Queue schreibt).
  * Implementiert den Celery-Worker, der die Mails sendet.
* **Entwickler C (Frontend-Lead):**
  * Richtet das React/TypeScript-Projekt ein.
  * Generiert den Axios-Client aus der `openapi.yaml`.
  * Implementiert die UI-Komponenten für die Benutzerpräferenzen und (falls nötig) die Historie.

Alle drei Entwickler können `docker-compose up` ausführen und haben sofort das gesamte System (Frontend, Backend-API, Worker, DB, Queue) lokal laufen.

## Einfache Version

### :speech_balloon: Phase 1: Der gemeinsame Plan (Die "Speisekarte")

Das Wichtigste zuerst: Wir müssen uns alle einig sein, **was** unser Service tun soll.

1. Die "Speisekarte" schreiben (OpenAPI):

   Wir (alle drei Entwickler) setzen uns zusammen und schreiben eine "Speisekarte" (das ist die OpenAPI-Datei). Da steht genau drauf, welche "Gerichte" (Befehle) unser Service anbietet.
   * `POST /benachrichtigung` (Befehl: "Lieber Service, schick diese Info an User X.")
   * `GET /einstellungen` (Befehl: "Was will dieser User überhaupt bekommen?")
   * `PUT /einstellungen` (Befehl: "Der User will ab jetzt keine E-Mails mehr.")
2. Werkzeugkasten packen:

   Jeder installiert die Programme, die wir brauchen, um zu bauen und zu testen (Docker, Python, Node.js).
3. Die Baustelle einrichten (Git):

   Wir erstellen einen zentralen Ordner (ein Git-Repository), in dem wir unseren Code ablegen: einen Ordner für die "Küche" (Backend) und einen für die "Benutzeroberfläche" (Frontend).

---

### :cooking: Phase 2: Die "Küche" bauen (Das Backend)

Jetzt baut einer (oder zwei) von euch das Herzstück des Services.

1. Das Grundgerüst (FastAPI):

   Wir bauen die leere Küche mit Python (FastAPI).
2. Das "Gedächtnis" (Datenbank):

   Wir setzen die Datenbank (PostgreSQL) auf. Wir legen fest, wo wir uns merken, welche Nachricht wann gesendet wurde und was die Nutzer eingestellt haben.
3. Die "Speisekarte" anschließen:

   Wir nehmen die Befehle von unserer Speisekarte (aus Phase 1) und bauen sie als "leere" Funktionen in die Küche ein. Sie nehmen Anrufe entgegen, tun aber noch nicht viel.
4. Der "Startknopf" (Docker Compose):

   Wir erstellen eine Datei (docker-compose.yml), die wie ein Hauptschalter funktioniert. Egal, auf welchem Computer: Man drückt "Start", und die Küche (Backend) UND das Gedächtnis (Datenbank) laufen sofort los.

---

### :runner: Phase 3: Der "Postbote" (Das Wichtigste!)

Das ist der Trick bei einem Benachrichtigungs-Service. E-Mails zu senden dauert lange. Unser Service soll Aufträge nur annehmen, nicht darauf warten, bis die Post zugestellt ist.

1. Den "Briefkasten" (Redis) aufstellen:

   Wir fügen einen superschnellen Briefkasten (Redis) hinzu.
2. Die Küche entlasten:

   Wenn jetzt ein anderer Service anruft (z.B. "Sende 50 E-Mails"), legt unsere Küche (FastAPI) die 50 Aufträge nur in den Briefkasten und sagt sofort: "Erledigt, nächster!" (Das dauert Millisekunden).
3. Den "Postboten" (Celery) einstellen:

   Wir bauen einen separaten Helfer, den Postboten (Celery). Seine einzige Aufgabe: Er schaut ununterbrochen in den Briefkasten.
   * Sieht er einen Auftrag? Nimmt er ihn.
   * Er geht zur Post (mit `smtplib`), schickt die E-Mail ab.
   * Er hakt die Aufgabe im Gedächtnis (Datenbank) als "gesendet" ab.

**Vorteil:** Die Küche ist nie blockiert und kann Tausende Anrufe annehmen, während der Postbote im Hintergrund die Arbeit macht.

---

### :art: Phase 4: Die Benutzeroberfläche (Das Frontend)

Parallel zu Phase 2 und 3 kann der dritte Entwickler die Webseite bauen, die der Nutzer sieht.

1. Die Webseite bauen (React):

   Wir bauen die Einstellungs-Seite (mit React), auf der der Nutzer seine Häkchen setzen kann (z.B. "Neue Aufgabe im Kurs: Ja, bitte per E-Mail").
2. Automatische "Fernbedienung" (Client):

   Jetzt kommt der Trick: Wir nehmen unsere "Speisekarte" (die OpenAPI-Datei aus Phase 1) und lassen ein Tool automatisch den Code (TypeScript/Axios) für das Frontend erstellen.
3. Knöpfe anschließen:

   Das Frontend-Team muss nicht raten, wie man die Küche ruft. Es nutzt einfach die fertigen Befehle aus der "Fernbedienung", um die Einstellungen des Nutzers zu laden oder zu speichern.

---

### :package: Phase 5: Testen und "Auf Sendung" gehen

Zum Schluss sorgen wir dafür, dass alles läuft und online geht.

1. Qualitätskontrolle (Tests):

   Wir schreiben automatische Tests. (Test 1: "Kommt ein Auftrag im Briefkasten an?" Test 2: "Ändert sich die Einstellung, wenn ich im Frontend auf 'Speichern' klicke?").
2. Die "Verpackungs-Maschine" (CI/CD):

   Wir richten einen Automatismus ein: Jedes Mal, wenn wir Code ändern, wird alles automatisch getestet und in fertige "Pakete" (Docker-Images) verpackt.
3. Veröffentlichen (Rancher/Kubernetes):

   Wenn die Tests erfolgreich waren, werden diese Pakete automatisch auf die große Produktions-Maschine (Kubernetes, verwaltet über Rancher) geschoben, damit echte Nutzer den Service verwenden können.