
[[_TOC_]]

---

## Status

**Akzeptiert** 


---

## Context

In unserer Microservice-Architektur sollen Services asynchron über RabbitMQ kommunizieren.
Jeder Service kann in einer anderen Programmiersprache implementiert (z. B. Node.js, Java, Python, Go) werden.
Dadurch kann keine gemeinsame Code-Library für Event-Publishing und -Subscription geteilt werden.

Dennoch müssen Events einheitlich beschrieben, kompatibel verarbeitet und **nachvollziehbar** sein, um:

* Integrationsfehler zu vermeiden
* Serviceentkopplung sicherzustellen
* Eventversionierung zu ermöglichen
* Observability und Debugging zu vereinfachen

Wir benötigen daher eine standardisierte, sprachunabhängige Schnittstelle zur Event-Kommunikation.

---

## Decision

Wir definieren eine standardisierte Event-Schnittstelle basierend auf einem sprachunabhängigen Event-Contract
Jeder Service, unabhängig von seiner Implementierungssprache, muss Events gemäß dieser Spezifikation publizieren und verarbeiten.

### 1. Event-Format (JSON-basiert)

Alle Events werden als UTF-8 kodiertes JSON übertragen.
Pflichtfelder:

```json
{
  "eventId": "uuid",
  "eventType": "Domain.EventName",
  "source": "service-name",
  "timestamp": "2025-11-06T10:30:00Z",
  "version": "1.0",
  "correlationId": "trace-id",
  "payload": { }
}
```

**Felder:**

| Feld            | Beschreibung                                |
| --------------- | ------------------------------------------- |
| `eventId`       | Eindeutige ID pro Event (UUIDv4)            |
| `eventType`     | Typname des Events, z. B. `User.Created`    |
| `source`        | Name des publizierenden Services            |
| `timestamp`     | UTC-Zeitpunkt der Erzeugung                 |
| `version`       | Version des Eventschemas                    |
| `correlationId` | Tracing-ID zur Nachverfolgung über Services |
| `payload`       | Domänenspezifische Daten des Events         |

---

### 2. Transport

* RabbitMQ soll als Message Broker genutzt werden.
* Es wird pro Domäne ein Topic Exchange verwendet (z. B. `user.events`, `order.events`).
* Routing Keys folgen dem Muster `<Domain>.<EventName>` (z. B. `User.Created`).
* Jeder Service verwaltet eigene Queues mit Bindings auf die relevanten Eventtypen.

Beispiel:

```
Exchange: user.events (topic)
Routing Key: User.Created
Queue: notification-service.user.created
```

---

### 3. Schema-Definition

* Event-Schemas werden als **JSON-Schema-Dateien** gepflegt (`*.schema.json`).
* Diese liegen zentral in einem **Repository „event-contracts“**.
* Versionierung über Dateinamen (z. B. `user.created.v1.schema.json`).
* Publisher müssen ihr Event vor Versand gegen das Schema validieren.
* Consumer müssen nur validieren, wenn sie strikte Payload-Abhängigkeiten haben.

---

### 4. Dokumentation

* Alle Events werden in einer **AsyncAPI-Spezifikation** beschrieben.
* Diese dient als zentrale Dokumentation und Quelle für Generierung von Stubs/Validierungen (optional).
* Beispiel:

  ```
  /events/user/user.created.v1.schema.json
  /events/order/order.shipped.v2.schema.json
  ```

---

### 5. Governance

* Änderungen an Event-Schemas unterliegen einem Review-Prozess.
* Breaking Changes erfordern eine **neue Version** (z. B. `v2`).
* Alte Eventversionen bleiben für Übergangszeit konsumierbar.

---

## Consequences

**Positive:**

* Services in beliebigen Sprachen können interoperabel Events austauschen.
* Klare, überprüfbare Contracts verhindern Integrationsfehler.
* AsyncAPI + JSON Schema ermöglichen automatisierte Dokumentation.
* Saubere Versionierung erlaubt evolutionäre Weiterentwicklung.

**Negative / Trade-offs:**

* Erhöhter Pflegeaufwand für zentrale Event-Schemas.
* Keine gemeinsame Library – jeder Service muss selbst publish/subscribe implementieren.
* Eventvalidierung kann Performance kosten.
* Governance-Prozess verlangsamt spontane Schemaänderungen.

