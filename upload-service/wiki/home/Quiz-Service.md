# Quiz-Service – Schnittstellenübersicht

## **Course-Service**

**Richtung:** Bidirektional\
**Kommunikation:** DOM-Event + REST (Callback)

- **Create Quiz:**\
  `<quiz-create courseId={course_id}></quiz-create>`\
  → erzeugt DOM-Event `quizCreated` mit `quiz_id`
- **Edit Quiz:**\
  `<quiz-edit id={quiz_id}></quiz-edit>`\
  → erzeugt DOM-Event `quizSaved` bei Speichern
- **Delete Quiz:**\
  `DELETE /quiz/{id}`\
  → Callback an Course-Service, um Quiz aus Kursen zu entfernen

---

## **Content Gen Service**

**Richtung:** Content Gen-Service (Komponente) → Quiz-Service (Komponente)\
**Kommunikation:** DOM-Event

→ Liefert H5P-Quiz inklusive Metadaten (bei _automatisierter Quiz-Erstellung)_

---

## **Challenge Service**

**Richtung:** Quiz-Service → Challenge-Service\
**Kommunikation:** RabbitMQ Event

- Event: `QUIZ_COMPLETED`\
  → Sendet `quizId` + `userId` an Challenge Service

---

## **User-Service (API Gateway)**

**Richtung:** Quiz-Service → User-Service\
**Kommunikation:** REST

- `GET /user/{userId}` → Nutzerinfos für Ownership

---

## **Achievement Service**

**Richtung:** Quiz-Service → Achievement-Service\
**Kommunikation:** RabbitMQ Event

- Event: `QUIZ_COMPLETED`\
  → Sendet `quizId` + `userId` an Achievement Service
