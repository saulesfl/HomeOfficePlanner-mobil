# Home Office Planner Android PWA v0.6.2

Aplicație complet statică, fără backend, conturi sau sincronizare. Fiecare instalare păstrează datele exclusiv în IndexedDB pe dispozitivul respectiv.

## Conținut

- HTML, CSS și JavaScript fără framework și fără proces de build;
- manifest PWA și service worker pentru instalare și funcționare offline;
- calcul local al sărbătorilor legale din România, inclusiv sărbătorile ortodoxe mobile;
- import pentru backup nativ și format desktop;
- export JSON complet;
- atingere directă pe o zi lucrătoare pentru adăugarea sau eliminarea Home Office;
- afișarea denumirii sărbătorii legale la atingerea zilei;
- copie locală de siguranță înainte de înlocuirea datelor prin import.

## Testare locală

Service worker-ul necesită HTTP sau HTTPS, nu deschiderea directă a `index.html`. Folosește orice server static. Exemple:

```powershell
# Opțional, dacă Node.js este deja instalat
npx --yes serve . -l 8080
```

sau extensia **Live Server** din Visual Studio Code. Deschide `http://127.0.0.1:8080/`.

Aplicația finală nu necesită Node.js. Node.js este folosit numai opțional pentru testele automate:

```powershell
node tests/test-static.js
```

Pentru testul IndexedDB în browser, deschide `http://127.0.0.1:8080/tests/test-browser.html` și apasă butonul de test.

## Publicare și instalare Android

1. Publică exact conținutul folderului pe GitLab Pages, inclusiv într-un subfolder.
2. Accesează adresa HTTPS în Chrome pentru Android.
3. Folosește butonul `Instalează` sau meniul Chrome, `Add to Home screen` / `Install app`.
4. Deschide aplicația o dată online pentru popularea cache-ului.
5. Activează modul avion și redeschide aplicația din iconiță pentru verificarea offline.

## Date și backup

- IndexedDB este sursa de adevăr locală;
- actualizarea service worker-ului nu șterge IndexedDB;
- exportă periodic backupul JSON;
- importul validează și rezumă datele, cere confirmare și creează o copie locală de siguranță.


### Instalare iOS
- În Safari pe iPhone/iPad, butonul „Instalare iOS” din antet deschide instrucțiunile pentru Partajare → Adăugați la ecranul principal.
- În modul standalone, butonul de instalare este ascuns automat.

### Actualizări PWA
- Aplicația verifică automat dacă există o versiune nouă.
- Când actualizarea este pregătită, utilizatorul poate alege „Actualizează acum” sau „Mai târziu”.
- Datele locale din IndexedDB rămân păstrate.
