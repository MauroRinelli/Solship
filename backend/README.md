# Solship Backend API

Backend API server per Solship - Sistema di Gestione Spedizioni con database MySQL.

## Tecnologie Utilizzate

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **MySQL** - Database relazionale
- **mysql2** - Driver MySQL per Node.js
- **JWT** - Autenticazione (opzionale)
- **CORS** - Gestione Cross-Origin requests

## Prerequisiti

Prima di iniziare, assicurati di avere installato:

1. **Node.js** (versione 16 o superiore)
   ```bash
   node --version
   ```

2. **MySQL** (versione 5.7 o superiore)
   ```bash
   mysql --version
   ```

## Installazione

### 1. Installa le dipendenze

```bash
cd backend
npm install
```

### 2. Configura MySQL

#### Avvia MySQL

**Windows:**
```bash
# Se installato come servizio
net start MySQL

# Oppure tramite XAMPP/WAMP
```

**Linux/Mac:**
```bash
sudo systemctl start mysql
# oppure
sudo service mysql start
```

#### Accedi a MySQL

```bash
mysql -u root -p
```

### 3. Configura il file .env

Il file `.env` è già stato creato con valori di default. Modificalo se necessario:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tua_password_mysql
DB_NAME=solship

# JWT Configuration
JWT_SECRET=tuo_secret_key_sicuro
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:8080
```

**IMPORTANTE:** Modifica `DB_PASSWORD` con la password del tuo utente MySQL root!

### 4. Crea il database e le tabelle

Esegui lo script di migrazione:

```bash
npm run migrate
```

Questo comando:
- Crea il database `solship`
- Crea le tabelle: `users`, `destinations`, `shipments`, `settings`
- Configura gli indici per prestazioni ottimali

### 5. Crea un utente demo (opzionale)

Per testare l'applicazione, puoi creare un utente demo:

```bash
mysql -u root -p
```

```sql
USE solship;

INSERT INTO users (username, email, password_hash, full_name)
VALUES ('demo', 'demo@solship.com', 'demo123', 'Demo User');
```

Nota: L'ID di questo utente sarà 1 (usato nell'autenticazione di sviluppo).

## Avvio del Server

### Modalità Sviluppo (con auto-reload)

```bash
npm run dev
```

### Modalità Produzione

```bash
npm start
```

Il server si avvierà su: `http://localhost:3000`

## Verifica Installazione

### 1. Test connessione server

```bash
curl http://localhost:3000/health
```

Risposta attesa:
```json
{
  "status": "ok",
  "timestamp": "2024-01-05T10:00:00.000Z",
  "uptime": 1.234
}
```

### 2. Test API

```bash
# Lista destinazioni
curl http://localhost:3000/api/destinations

# Lista spedizioni
curl http://localhost:3000/api/shipments
```

## Struttura API

### Endpoints Disponibili

#### Destinazioni

- `GET /api/destinations` - Lista tutte le destinazioni
- `GET /api/destinations?q=search` - Cerca destinazioni
- `GET /api/destinations/:id` - Dettaglio destinazione
- `POST /api/destinations` - Crea nuova destinazione
- `PUT /api/destinations/:id` - Aggiorna destinazione
- `DELETE /api/destinations/:id` - Elimina destinazione

#### Spedizioni

- `GET /api/shipments` - Lista tutte le spedizioni
- `GET /api/shipments?q=search` - Cerca spedizioni
- `GET /api/shipments/:id` - Dettaglio spedizione
- `GET /api/shipments/stats` - Statistiche spedizioni
- `POST /api/shipments` - Crea nuova spedizione
- `PUT /api/shipments/:id` - Aggiorna spedizione
- `DELETE /api/shipments/:id` - Elimina spedizione

### Formato Richieste

#### Esempio: Crea Destinazione

```bash
curl -X POST http://localhost:3000/api/destinations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mario Rossi",
    "company": "Acme Inc",
    "address": {
      "street": "Via Roma 123",
      "city": "Milano",
      "state": "MI",
      "zipCode": "20100",
      "country": "Italy"
    },
    "phone": "+39 02 1234567",
    "email": "mario@example.com"
  }'
```

#### Esempio: Crea Spedizione

```bash
curl -X POST http://localhost:3000/api/shipments \
  -H "Content-Type: application/json" \
  -d '{
    "destinationId": "1234567890-abc",
    "trackingNumber": "IT123456789",
    "carrier": "DHL",
    "status": "pending",
    "shipDate": "2024-01-05",
    "expectedDelivery": "2024-01-10",
    "items": "Pacco con documenti",
    "weight": 2.5,
    "dimensions": "30x20x10",
    "cost": 15.50,
    "currency": "EUR"
  }'
```

## Struttura Database

### Tabella `users`
- `id` - ID utente (auto-increment)
- `username` - Nome utente (unique)
- `email` - Email (unique)
- `password_hash` - Password hashata
- `full_name` - Nome completo
- `created_at`, `updated_at` - Timestamp

### Tabella `destinations`
- `id` - ID destinazione (UUID)
- `user_id` - Riferimento a users
- `name` - Nome destinatario
- `company` - Azienda
- `street`, `city`, `state`, `zip_code`, `country` - Indirizzo
- `phone`, `email` - Contatti
- `notes` - Note
- `created_at`, `updated_at` - Timestamp

### Tabella `shipments`
- `id` - ID spedizione (UUID)
- `user_id` - Riferimento a users
- `destination_id` - Riferimento a destinations
- `tracking_number` - Numero tracking (unique)
- `carrier` - Corriere
- `status` - Stato (pending, in-transit, delivered, cancelled, returned)
- `ship_date` - Data spedizione
- `expected_delivery` - Consegna prevista
- `actual_delivery` - Consegna effettiva
- `items` - Descrizione articoli
- `weight` - Peso (kg)
- `dimensions` - Dimensioni
- `cost` - Costo
- `currency` - Valuta
- `notes` - Note
- `created_at`, `updated_at` - Timestamp

## Troubleshooting

### Errore: "Database connection failed"

1. Verifica che MySQL sia in esecuzione
2. Controlla username e password in `.env`
3. Verifica che il database `solship` esista

```bash
mysql -u root -p -e "SHOW DATABASES;"
```

### Errore: "Port 3000 already in use"

Cambia la porta nel file `.env`:
```env
PORT=3001
```

### Errore: "Cannot find module"

Reinstalla le dipendenze:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Sviluppo

### Aggiungere nuovi endpoint

1. Crea il controller in `/controllers`
2. Crea le route in `/routes`
3. Registra le route in `server.js`

### Modificare lo schema database

1. Crea un nuovo file SQL in `/migrations`
2. Esegui manualmente:
   ```bash
   mysql -u root -p solship < migrations/002_your_migration.sql
   ```

## Sicurezza

**IMPORTANTE per la produzione:**

1. Cambia `JWT_SECRET` con una stringa casuale sicura
2. Usa HTTPS
3. Implementa autenticazione JWT completa (vedi `/middleware/auth.js`)
4. Configura rate limiting
5. Valida tutti gli input
6. Non committare il file `.env`

## Licenza

MIT
