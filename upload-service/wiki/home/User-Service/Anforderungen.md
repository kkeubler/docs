# Gesetzte Anforderungen

- Nutzerspezifische Daten werden im User Service gehalten
- Nutzeranfragen aus dem Internet werden über den User Service authentifiziert
- An andere Services werden Pseudo IDs weitergegeben
- Der Service stellt Zugriffsrechte in Bezug auf andere Service-Ressourcen bereit (Permission handling)
  * Ressourcen-Zugriffsrechte (Scopes) werden an Request geschrieben oder über REST-API abfragbar
  * (recht komplex ➝ später umgesetzt)
  * (möglicherweise weitere Microservice mit eigener Datenhaltung)

# Zu klärende Anforderungen

- Integration in HdM LDAP
- Achievement Service möchte:
  * gibt es diesen User
  * Wissen wie lange ein Nutzer eingeloggt ist oder wann zuletzt eingeloggt
- File Upload Service möchte:
  * Endpunkt der Namen Auskunft gibt
  * Berechtigung, ob jemand etwas hochladen darf
- Wir wollen von Course Service:
  * User creates a course (=> role admin)
  * Does user have permission
  * Admin updated role of other user
  * User enters course
  * What corusers are available