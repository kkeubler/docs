# Challenge Service

Ansprechpartner: Tobias Heim Galindo (th133), Cedric Gottschalk (cg103), Tom Götz (tg090)

##  Zweck

Der Challenge Service ist verantwortlich für die Erstellung, Verwaltung und Verfolgung von Benutzer-Herausforderungen (Dailies, Weeklies, Seasonals). Er fungiert als zentraler Hub, der Aktionen aus anderen Services (z.B. Quiz, Kurs) konsumiert, den Fortschritt des Users speichert und bei Abschluss Events an das Punkte- und Achievement-System sendet.

##  Hauptfunktionen

* **Challenge-Management:** Definiert und verwaltet den Lebenszyklus von Daily-, Weekly- und Seasonal-Challenges.
* **Fortschritts-Tracking:** Speichert den individuellen Fortschritt eines Users für jede aktive Challenge (z.B. 2/3 Quizze abgeschlossen).
* **Event-Verarbeitung:** Nimmt Events von anderen Services (siehe unten) über einen Webhook-Endpunkt (`POST /challenges/events`) entgegen.
* **XP-Auschüttung:** Löst die Ausschüttung von Belohnungen (XP) wenn eine Challenge abgeschlossen wird.

## API-Interaktionen (Abhängigkeiten)

Dieser Service ist stark event-gesteuert.

### Eingehend (Was wir konsumieren)

Wir benötigen Events über RABBITMQ von folgenden Services, um den Challenge-Fortschritt zu aktualisieren:

* **Quiz Service:** Sendet `QUIZ_COMPLETED` Events.
* **Kurs Service:** Sendet `LECTION_COMPLETED`/ `COURSE_COMPLETED` Events.
* **User:** Sendet `USER_LOGIN` Events damit wir die daily login xp geben können tracken können.

### Ausgehend (Was wir anbieten)

1.  **Event-Publishing (RabbitMQ):**
    * `CHALLENGE_COMPLETED` (an **Achievement Service**): Wird gesendet, wenn ein User eine Challenge abschließt inklusive der rewards

2.  **REST API (Datenabruf):**
    * `GET /challenges/user/{userId}/`: Liefert aktive Challenges (inkl. Fortschritt)
```json
[
  {
    "userId": "user-instance-uuid-987",
    "challengeId": "daily-python-1",
    "title": "Tägliches Python-Workout",
    "description": "Teste dein Wissen und schließe heute ein beliebiges Python-Quiz ab.",
    "type": "DAILY", // DAILY, WEEKLY, SEASONAL
    
  
    "status": "ACTIVE", // ACTIVE, COMPLETED, EXPIRED
    
    "createdAt": "2025-10-30T23:59:59Z",
    "validUntil": "2025-10-30T23:59:59Z",
    "completedAt": "2025-10-30T23:59:59Z",

    "progress": {
      "criteria": [
        {
          "description": "Schließe 1 Python-Quiz ab",
          "currentValue": 0,
          "targetValue": 1
        }
      ]
    },

    "rewards": [
      {
        "type": "XP", // erstmal nur XP
        "amount": 200,
        "recieved": false // auf true setzen, wenn die exp dem User angerrechnet wurden
      }
    ]
  },
]
```



