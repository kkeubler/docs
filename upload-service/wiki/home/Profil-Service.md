## Zweck
Der Profil-Service ist der "digitale Ausweis und Persönlichkeits-Hub" jedes Benutzers. Er verwaltet alle persönlichen Informationen und Einstellungen, die nicht direkt mit Authentifizierung oder Kursinhalten zu tun haben, wie z.B. Displayname, Bio, Avatar, Institution, Department, Social Links. 

## Anforderungen

## Rest Endpoints

### Ausgehende Endpoints (Was wir anbieten)
| Method | Endpoint                    | Beschreibung                                                            |
| ------ | --------------------------- | ----------------------------------------------------------------------- |
| GET    | /profiles                   | Sucht und listet Profile basierend auf Filter- oder Suchparametern                         |
| GET    | /profiles/{userId}          | Liefert ein Profil über die Id                                          |
| GET    | /profiles/{userId}/settings | Liefert alle Einstellungen eines Profils                                |
| GET    | /profiles/{userId}/summary  | evtl kleinere Rückgabe, falls für irgendeinen Anwendungsfall sinnvoll   |
| POST   | /profiles                   | Erstellt ein neues Profil für einen Nutzer (beim Erstellen eines Users) |
| PATCH  | /profiles/{userId}          | Aktualisiert bestimmte Felder eines bestehenden Profils                 |
| GET    | /profiles/handle/{handle}   | Liefert ein Profil über den eindeutigen Handle                          |


### Eingehende Endpoints (Was wir konsumieren)
| Method | Endpoint               | Beschreibung                                                                                          |
| ------ | ---------------------- | ----------------------------------------------------------------------------------------------------- |
| GET    | /users/{userId}        | Liefert Basisinformationen zu einem Nutzer                                                            |
| GET    | /achievements/{userId} | Liefert alle erreichten Achievements eines Nutzers                                                    |
| POST   | /uploads/avatar        | Initiiert den Upload-Prozess für ein neues Profilbild und gibt eine Upload-URL oder Upload-ID zurück. |



## Events

## Ausgehende Events

Haben wir bisher keine

## Eingehende Events

| Event           | Service       |                                         |
| --------------- | ------------- | --------------------------------------- |
| AVATAR_UPLOADED | Upload Server | Bei erfolgreichem Speichern des Avatars |

Was das Erstellen und evtl Löschen des Profils angeht, könnte das auch an ein Event im User Service gekoppelt werden, statt über REST


## Datenmodelle
```
{
Profile:
  properties:
    userId:             string
    handle:             string           # unique, slug
    displayName:        string
    bio:                string           # @max(500), sanitized
    avatarUrl:          string
    role:               enum[student, instructor, admin]
    settings:
      streakGoal?:          number
      preferredStudyDays?:  string[]      # e.g. ["Mon","Wed","Fri"]
      reminderTimes?:       string[]      # "08:00"
    isPublic:               boolean       # default true
    createdAt:              string(date-time)
    updatedAt:              string(date-time)
}
```

## Mock Daten

### GET /profiles
```
{
  "page": 1,
  "pageSize": 3,
  "total": 42,
  "profiles": [
    {
      "userId": "u123",
      "handle": "lea.schmidt",
      "displayName": "Lea Schmidt",
      "bio": "Data Science student passionate about learning AI.",
      "avatarUrl": "https://cdn.learning.ai/avatars/lea.webp",
      "role": "student",
      "isPublic": true,
      "createdAt": "2025-03-10T08:30:00Z",
      "updatedAt": "2025-11-10T14:21:00Z"
    },
    {
      "userId": "u124",
      "handle": "marius.hahn",
      "displayName": "Marius Hahn",
      "bio": "Instructor in Software Engineering.",
      "avatarUrl": "https://cdn.learning.ai/avatars/marius.webp",
      "role": "instructor",
      "isPublic": true,
      "createdAt": "2025-04-15T09:00:00Z",
      "updatedAt": "2025-11-12T09:12:00Z"
    },
    {
      "userId": "u125",
      "handle": "admin.lisa",
      "displayName": "Lisa Admin",
      "bio": "Platform administrator and backend enthusiast.",
      "avatarUrl": "https://cdn.learning.ai/avatars/lisa.webp",
      "role": "admin",
      "isPublic": false,
      "createdAt": "2025-05-05T07:15:00Z",
      "updatedAt": "2025-11-11T19:03:00Z"
    }
  ]
}
```

### GET /profiles/{userId}
```
{
  "userId": "u123",
  "handle": "lea.schmidt",
  "displayName": "Lea Schmidt",
  "bio": "Data Science student passionate about learning AI.",
  "avatarUrl": "https://cdn.learning.ai/avatars/lea.webp",
  "role": "student",
  "settings": {
    "streakGoal": 7,
    "preferredStudyDays": ["Mon", "Wed", "Fri"],
    "reminderTimes": ["08:00"]
  },
  "isPublic": true,
  "createdAt": "2025-03-10T08:30:00Z",
  "updatedAt": "2025-11-10T14:21:00Z"
}
```

### GET /profiles/{userId}/settings
```
{
  "userId": "u123",
  "settings": {
    "streakGoal": 7,
    "preferredStudyDays": ["Mon", "Wed", "Fri"],
    "reminderTimes": ["08:00"]
  }
}
```

### GET /profiles/{userId}/summary
```
{
  "userId": "u123",
  "displayName": "Lea Schmidt",
  "handle": "lea.schmidt",
  "avatarUrl": "https://cdn.learning.ai/avatars/lea.webp",
  "role": "student"
}
```

### POST /profiles

Request:
```
{
  "userId": "u126",
  "displayName": "Jonas Meier",
  "role": "student"
}
```

Response:
```
{
  "userId": "u126",
  "handle": "jonas.meier",
  "displayName": "Jonas Meier",
  "bio": "",
  "avatarUrl": "",
  "role": "student",
  "preferences": {},
  "isPublic": true,
  "createdAt": "2025-11-12T09:45:00Z",
  "updatedAt": "2025-11-12T09:45:00Z"
}
```

### PATCH /profiles/{userId}

Request:
```
{
  "displayName: "Lea Schmidt",
  "bio": "Loves exploring AI in education.",
  "role": "student",
  "preferences": {
    "streakGoal": 10,
    "preferredStudyDays": ["Mon", "Wed", "Fri"],
    "reminderTimes": ["09:00", "20:00"]
  }
}
```

Response:
```
{
  "userId": "u123",
  "handle": "lea.schmidt",
  "displayName": "Lea Schmidt",
  "bio": "Loves exploring AI in education.",
  "avatarUrl": "https://cdn.learning.ai/avatars/lea.webp",
  "role": "student",
  "preferences": {
    "streakGoal": 10,
    "preferredStudyDays": ["Mon", "Wed", "Fri"],
    "reminderTimes": ["09:00", "20:00"]
  },
  "isPublic": true,
  "createdAt": "2025-03-10T08:30:00Z",
  "updatedAt": "2025-11-12T10:00:00Z"
}
```

### GET /profiles/handle/{handle}
```
{
  "userId": "u123",
  "handle": "lea.schmidt",
  "displayName": "Lea Schmidt",
  "bio": "Data Science student passionate about learning AI.",
  "avatarUrl": "https://cdn.learning.ai/avatars/lea.webp",
  "role": "student",
  "settings": {
    "streakGoal": 7,
    "preferredStudyDays": ["Mon", "Wed", "Fri"],
    "reminderTimes": ["08:00"]
  },
  "isPublic": true,
  "createdAt": "2025-03-10T08:30:00Z",
  "updatedAt": "2025-11-10T14:21:00Z"
}

```


