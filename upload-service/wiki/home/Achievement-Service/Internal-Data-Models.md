# Data Models

Diese Datenmodelle werden nur intern verwendet und nicht genau so in der Form über die APIs rausgegeben.

### `user_achievements`

```json
{
"user_id": "",
"level": 4, // int
"xp": 300, // int
"achievements": [
	"achievement_state": <state + achievement>
]
}
```

### `achievement`

```json
{
  "_id": "quiz_master",
  "name": "Quiz Master",
  "description": "Complete 10 quizzes",
  "category": "QUIZ", // QUIZ, COURSE, STREAK, SEASONAL, DA
  "xpReward": 500,
  "repeatable": false,
  "criteria": [
    {
      "eventType": "QUIZ_COMPLETED",
      "targetValue": 10,
      "metadata": { "topic": "any" }
    }
  ],
  "createdAt": ISODate("2025-11-05T09:00:00Z"),
  "image_resource":"<uri>"
}
```

### `achievement_state`

```json
{
"achievement_id": "",
"user_id": "",
"state": "ACTIVE", // COMPLETED, EXPIRED
"updated_at": "", // Date
"completed_at": None,
"progress": 0.5, // double
"dynamic_fields": "<arbitrary progress related data>"
}
```

### image

tbd