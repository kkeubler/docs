---
title: '014: Bindung von Quizzes an Kurs-Kontext'
---
[[_TOC_]]

## Status
Akzeptiert

## Context
Im Rahmen der Microservice-Architektur interagiert der **Course Service** eng mit dem **Quiz Service**. Es musste definiert werden, wie das Verhältnis zwischen Kursen und Quizzes modelliert wird, insbesondere im Hinblick auf Lebenszyklus und Zugriffsrechte.

Initial stand zur Debatte, ob Quizzes als eigenständige Entitäten existieren können (Globalität) oder ob sie strikt an einen Kurs gebunden sein müssen.

Die Anforderungen an das System priorisieren derzeit eine schnelle Implementierung und geringe Komplexität in der Inter-Service-Kommunikation.

## Decision
Wir haben uns in Abstimmung mit dem Team des Quiz Service entschieden, dass **Quizzes ausschließlich im Kontext eines Kurses existieren dürfen.**

Das bedeutet:
*   Ein Quiz referenziert zwingend eine `courseId`.
*   Es gibt keine "verwaisten" Quizzes ohne zugehörigen Kurs.
*   Die Erstellung eines Quizzes setzt einen existierenden Kurs voraus.

Diese Entscheidung wurde getroffen, um die Komplexität der Architektur gering zu halten (KISS-Prinzip). Sie vereinfacht das Berechtigungskonzept signifikant, da Zugriffsrechte für Quizzes direkt von den Kursberechtigungen abgeleitet werden können, anstatt eine eigene ACL (Access Control List) für Quizzes pflegen zu müssen.

## Consequences

**Positiv:**
*   **Reduzierte Komplexität:** Die API-Schnittstellen und das Datenmodell zwischen Course Service und Quiz Service sind einfacher, da keine n:m Beziehungen verwaltet werden müssen.
*   **Vereinfachtes Rechtemanagement:** Wer Zugriff auf den Kurs hat, hat (implizit) Zugriff auf die darin enthaltenen Quizzes.

**Negativ:**
*   **Keine direkte Wiederverwendbarkeit:** Ein Quiz kann nicht als Instanz in mehreren Kursen gleichzeitig verwendet werden. Soll ein Quiz in einem anderen Kurs genutzt werden, muss es dupliziert werden.
*   **Workaround für private Quizzes:** Es gibt keinen nativen "Entwurfsmodus" für Quizzes außerhalb von Kursen. Möchte ein Dozent ein privates Quiz erstellen oder testen, muss dafür ein privater "Platzhalter-Kurs" angelegt werden.