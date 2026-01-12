# **Content-Gen-Service (PDF → H5P) – kurze Integrationsdoku**

## **Zweck**

Aus PDFs eines Kurses wird ein H5P-Quiz erzeugt. Unser Service bringt ein eigenes **Micro-Frontend (MFE)** mit, das die PDF-Auswahl sowie Titel/Schwierigkeit erfasst und die Generierung auslöst.

---

## **Wie der Quiz-Service uns nutzt**

### **1) Micro-Frontend einbetten**

In `webpack.config.js`

```javascript
new ModuleFederationPlugin({ 
  remotes: {
    contentGen: "contentGen@https://content-gen.example.com/remoteEntry.js",
  },
  shared: {
    react: { singleton: true },
    "react-dom": { singleton: true },
  },
});
```

**Einbinden der Komponente im Quiz-Service:**

* `courseId` – ID des Kurses
* `` contentGenType ``– Typ der Generierung (idF. \``` quiz` ``)

```javascript
const openContentGen = async (courseId, contentGenType) => {
  const { default: ContentGenMFE } = await import("contentGen/MFE");
  render(
    <ContentGenMFE courseId={courseId} contentGenType={contentGenType} />,
    document.getElementById("contentgen-root")
  );
};
```

Das MFE wird also per dynamischem Import (GET-Request auf remoteEntry.js) geladen und innerhalb derselben App-Seite gerendert.

```xml
<Button onClick={() => openContentGen(currentCourseId, currentcontentGenType)}>
  Quiz generieren
</Button>
```

### **2) Event-Schnittstelle (postMessage)**

**Vom MFE an den Parent (Quiz-Service-Frontend):**

* `contentgen:ready` – MFE ist bereit.
* `contentgen:completed` – Quiz fertig.
* `contentgen:error` – Fehler.

#### **Return-JSON bei `contentgen:completed`**

```json
{
  "type": "contentgen:completed",
  "payload": {
    "jobId": "job_9a2d7c0b",
    "quiz": {
      "title": "Einführung in XY",
      "difficulty": "medium",
      "questionCount": 18
    },
    "h5p": {
      "packageUri": "https://cdn.contentgen.local/jobs/job_9a2d7c0b/out.h5p",
      "sizeBytes": 2482310,
      "sha256": "8d3f...f1a"
    },
    "meta": {
      "processingTimeMs": 87432,
      "generatorVersion": "1.4.2"
    }
  }
}
```

**Sicherheit:** Quiz-Service prüft `e.origin` (Allowlist `content-gen.example.com`).

---

### **3) Was der Quiz-Service danach tun kann**

* H5P-Paket über `h5p.packageUri` herunterladen und speichern.
* Quiz-Metadaten (`title`, `difficulty`, `questionCount`) persistieren.
* UI aktualisieren oder in den Quiz-Workflow zurückführen.

---

## **Was der Kurs-Service bereitstellen muss (intern von uns aufgerufen)**

### **Interner Read-Endpoint (Service-zu-Service)**

```
GET https://course-service.internal/api/v1/courses/{courseId}/pdfs
Auth: Bearer/OAuth2 (Service-Token)
```

**Erforderliche Felder pro PDF:**

* `pdfId` (stabil, eindeutig)
* `title`
* `sourceUri` (direkter Storage-Pfad / URL)
* `pages` (optional, aber empfohlen)
* `updatedAt` (optional)

> **Hinweis:** Der Kurs-Service muss keine UI liefern – nur diese API, damit unser MFE die Liste anzeigen kann.