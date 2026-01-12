---
title: Microfrontend Setup and Module Federation
---
[[_TOC_]]

# Introduction

Um alle Microservice zu einer Anwendung zu kombinieren, benötigen wir ein System, um alle Frontend Microservies zu einer Webapp zu kombinieren. Dafür gibt es eine **host-app** in welche alle Microservices reingeladen werden. Technisch umgesetzt wird das mit **webpack module federation**. Ein React Template wird bereitgestellt, um die Funktionalität der Microfrontend-Architektur zu gewährleisten. Bei Benutzung des Templates müssen sich die Teams nicht um die Webpackkonfiguration und Kompatibilität kümmern.

# Anforderungen

- Theoretisch können alle Javascript Frameworks verwendet werden, sie müssen jedoch mit webpack kompatibel sein.
  * → :rotating_light: Next Version 16 ist **nicht** kompatibel :rotating_light: Wir würden von Next abraten, da Next sein eigenes Ding macht (bsp. keine `webpack.config.ts` sondern `next.config.ts` ) und wir eine Funktionalität mit der host-app nicht garantieren können.
- Jedes Team darf sein eigenes microfrontend bauen und kümmert sich um die integration in die host-app
- Die Issues/PRs zur Integration in die host-app dürfen nur vom Dashboard-Service Team approved werden
- Das Dashboard Team gibt Support über [Matrix](https://matrix.mi.hdm-stuttgart.de/#/room/!GcPQlXptiZhfeWjBLo:matrix.mi.hdm-stuttgart.de) zum Template. Andere Architekturen können wir nicht supporten. Hier muss sich das Team vollstänig selbst um die Integration in die host-app kümmern.

# Hinweise

* Haltet euch bitte an den Styleguide und nutzt so wenige eigene Styles wie möglich. Wie das funktioniert, lernt ihr im [Style Guide ADR](https://gitlab.mi.hdm-stuttgart.de/aidrivensoftwaredev/semester/ws2526/moodleduo/-/wikis/home/ADRs/011-Style-Guide)
* Achtet auf die Kommentare im Code. Die Kommentare sollten die meisten Fragen hoffentlich beantworten :raised_hands:
* **Support** zur Integration des **Templates** in die **host-app** geben wir im [Matrix ](https://matrix.mi.hdm-stuttgart.de/#/room/!GcPQlXptiZhfeWjBLo:matrix.mi.hdm-stuttgart.de)Raum **microfrontend-support**

# Quick Start Guide

1. Clone das Projekt und stelle sicher, dass du auf `main` bist und `main` aktuell ist
2. Im Ordner templates/microfrontend-template findest du das microfrontend template
3. Kopiere den Inhalt vom Ordner microfrontend-template in den Ordner für dein microfrontend. Das Template selbst darf nicht bearbeitet werden!
4. Benenne das React Projekt in der `package.json` um, indem du `name` anpasst
5. Passe die `webpack.config.cjs` an:
   1. `ModuleFederationPlugin --> name`
   2. `ModuleFederationPlugin --> exposes`
   3. `devServer --> port`
6. Starte das Projekt mit `npm run dev`
7. In `src/App.tsx `kannst du anfangen, dein microfrontend zu entwickeln

# Integration der microfrontends in die host-app

1. Stelle sicher, dass dein Microfrontend läuft
2. Öffne die `webpack.config.cjs` der host-app
3. Importiere dein microfrontend hier, indem du dein microfrontend in `ModuleFederationPlugin --> remotes` hinzufügt. Nutze dieses Muster:

```javascript
your_microfrontend_import_name: isProduction
?'your_microfrontend_config_name@https://app.studyfai.de/_mf/<name>/remoteEntry.js'
:'your_microfrontend_config_name@your_microfrontend_name@http://localhost:<port>/remoteEntry.js'
```

4. Damit ist dein Microfrontend erfolgreich in die host-app importiert :partying_face:
5. Jetzt kannst du dein Microfrontend in einer Page oder Component wie folgt importieren:

```javascript
import { loadMicrofrontend } from '@/utils/loadmicrofrontend';

// Replace 'your_microfrontend_import_name/App' with the actual name and entrypoint of your microfrontend
const YourComponent = loadMicrofrontend(() => import("your_microfrontend_import_name/App"));
```

## Styling

Um den [Style Guide ADR](home/ADRs/011-Style-Guide) einzuhalten, musst du folgendes tun:

1. Wenn du das template nutzt, ist shadcn/ui bereits aufgesetzt und konform mit dem Styleguide. Wenn du das template nicht nutzt, stelle sicher, dass du shadcn/ui entsprechend aufsetzt. Die Dokus dazu sind im Style Guide ADR verlinkt.
2. Setzte den [shadcn/ui MCP Server](https://ui.shadcn.com/docs/mcp) korrekt auf, damit Copilot, etc. die components korrekt verwenden können. Das geht sehr einfach über npx, bspw: `npx shadcn@latest mcp init --client vscode`
3. Wenn du das UI promptest, erwähne trotzdem, dass shadcn/ui benutzt werden soll, bsp: "Erstelle eine card component. Nutze shadcn/ui"
4. Fertig, jetzt kannst du loslegen :partying_face:
5. **Hinweis: Das Styling läuft über die index.css Datei. Es ist wichtig, dass diese nicht geändert wird!**

## Troubleshooting

Falls das Styling eures Frontends im `frontend-host-service`⁣⁣⁣ plötzlich anders aussieht, als wenn es "eigenständig" läuft, versucht Folgendes:

1. Stellt sicher, dass euer Branch auf dem aktuellen Stand vom `main` branch ist
2. Kopiert die index.css aus dem `frontend-host-service`
3. Stellt sicher, dass die index.css in der Datei importiert wird, die ihr in der webpack config exposed

   (Bsp.: Wenn ihr die App.tsx exposed, stellt sicher, dass in der App.tsx mit `import './index.css'` die index.css auch importiert wird)
4. Schaut euch an, wie es im dashboard-service microfrontend gemacht ist
5. Wenn das nicht hilft, meldet euch gerne über [Matrix ](https://matrix.mi.hdm-stuttgart.de/#/room/!GcPQlXptiZhfeWjBLo:matrix.mi.hdm-stuttgart.de)oder sprecht das Dashboard Team während des Kurses an :)