# Solship - Sistema di Gestione Spedizioni

Applicazione web completa per la gestione di spedizioni e rubrica destinatari, ora con database SQL!

## Struttura Progetto

```
Solship/
├── backend/              # Backend Node.js + Express + MySQL
│   ├── config/          # Configurazione database
│   ├── controllers/     # Logica business
│   ├── models/          # Modelli database
│   ├── routes/          # API REST endpoints
│   ├── middleware/      # Middleware autenticazione
│   ├── migrations/      # Script SQL database
│   └── server.js        # Server Express
│
├── css/                 # Stili frontend
├── js/                  # JavaScript frontend (componenti)
├── assets/              # Immagini e risorse
├── index.html           # Pagina principale
└── StorageService.js    # Servizio storage (ora usa API)
```

## Tecnologie

### Backend
- **Node.js** + **Express** - Server API REST
- **MySQL** - Database relazionale
- **JWT** - Autenticazione (opzionale)

### Frontend
- **HTML5** + **CSS3** + **JavaScript ES6**
- **Fetch API** - Chiamate HTTP
- **LocalStorage** - Settings locali

## Installazione Rapida

### 1. Prerequisiti

- Node.js 16+ ([Download](https://nodejs.org))
- MySQL 5.7+ ([Download](https://dev.mysql.com/downloads/))

### 2. Installa Backend

```bash
# Vai nella cartella backend
cd backend

# Installa dipendenze
npm install

# Configura database
# Modifica backend/.env con le tue credenziali MySQL
nano .env  # oppure usa un editor di testo

# Crea database e tabelle
npm run migrate

# Avvia server
npm run dev
```

Il backend sarà disponibile su: `http://localhost:3000`

### 3. Avvia Frontend

```bash
# Dalla root del progetto
# Usa qualsiasi server HTTP, ad esempio:

# Con Python 3
python -m http.server 8080

# Con Node.js http-server
npx http-server -p 8080

# Con PHP
php -S localhost:8080
```

Il frontend sarà disponibile su: `http://localhost:8080`

### 4. Apri l'applicazione

Vai su: `http://localhost:8080`

## Configurazione Database

### Modifica credenziali MySQL

Apri `backend/.env` e configura:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tua_password_qui
DB_NAME=solship
```

### Crea utente demo

```bash
mysql -u root -p
```

```sql
USE solship;

INSERT INTO users (username, email, password_hash, full_name)
VALUES ('demo', 'demo@solship.com', 'demo123', 'Demo User');
```

## Funzionalità

- **Dashboard** - Statistiche e panoramica
- **Gestione Spedizioni** - Crea, modifica, elimina spedizioni
- **Rubrica Destinatari** - Gestisci contatti e indirizzi
- **Ricerca** - Cerca spedizioni e destinatari
- **Filtri** - Filtra per stato, corriere, data
- **Export** - Esporta dati in CSV e JSON
- **Database SQL** - Dati persistenti e sicuri
- **API REST** - Backend scalabile

## API Endpoints

### Destinazioni
- `GET /api/destinations` - Lista destinazioni
- `POST /api/destinations` - Crea destinazione
- `PUT /api/destinations/:id` - Aggiorna
- `DELETE /api/destinations/:id` - Elimina

### Spedizioni
- `GET /api/shipments` - Lista spedizioni
- `GET /api/shipments/stats` - Statistiche
- `POST /api/shipments` - Crea spedizione
- `PUT /api/shipments/:id` - Aggiorna
- `DELETE /api/shipments/:id` - Elimina

Documentazione completa: [backend/README.md](backend/README.md)

## Troubleshooting

### Backend non si avvia

1. Verifica che MySQL sia in esecuzione:
   ```bash
   sudo service mysql status
   ```

2. Controlla le credenziali in `backend/.env`

3. Verifica che la porta 3000 sia libera

### Frontend non carica dati

1. Verifica che il backend sia avviato (`http://localhost:3000`)
2. Controlla la console del browser per errori
3. Verifica che l'URL API in `StorageService.js:3` sia corretto

### Errori CORS

Assicurati che in `backend/.env` sia configurato:
```env
CORS_ORIGIN=http://localhost:8080
```

## Prossimi Passi

- [ ] Implementare autenticazione JWT completa
- [ ] Aggiungere multi-utente con login
- [ ] Implementare tracking in tempo reale
- [ ] Aggiungere notifiche email
- [ ] Dashboard avanzata con grafici
- [ ] App mobile

## Contribuire

1. Fork del progetto
2. Crea un branch (`git checkout -b feature/nuova-feature`)
3. Commit delle modifiche (`git commit -m 'Aggiunge nuova feature'`)
4. Push al branch (`git push origin feature/nuova-feature`)
5. Apri una Pull Request

## Licenza

MIT

## Supporto

Per problemi o domande:
- Apri un Issue su GitHub
- Consulta la documentazione in `backend/README.md`

---

**Fatto con ❤️ per gestire le spedizioni in modo efficiente**
