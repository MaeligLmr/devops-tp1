# TP1 - DEVOPS - M1 DEV

API CRUD d'equipes et joueurs de football avec authentification JWT.

## Technologies utilisees

- Node.js
- Express
- MongoDB
- mongodb (driver officiel)
- bcrypt
- jsonwebtoken

## Architecture model / route / controller

```text
.
|-- index.js
|-- src/
|   |-- app.js
|   |-- config/
|   |   `-- database.js
|   |-- controllers/
|   |   |-- authController.js
|   |   |-- teamController.js
|   |   `-- playerController.js
|   |-- middlewares/
|   |   `-- authMiddleware.js
|   |-- models/
|   |   |-- teamModel.js
|   |   |-- playerModel.js
|   |   `-- userModel.js
|   `-- routes/
|       |-- authRoutes.js
|       |-- teamRoutes.js
|       `-- playerRoutes.js
|-- package.json
`-- README.md
```

## Role de chaque couche

- Models: acces MongoDB (lecture, insertion, mise a jour, suppression).
- Controllers: logique metier, validation des donnees, codes HTTP retournes.
- Routes: mapping URL -> controller.
- Middleware: verification du token JWT (`Authorization: Bearer ...`).
- Config: connexion MongoDB et creation des index.

## Installation

1. Installer MongoDB Server.
2. Lancer MongoDB localement sur le port 27017.
3. Installer les dependances:

```bash
npm install
```

4. Lancer l'API:

```bash
npm start
```

## Configuration Mongo

- URI par defaut: `mongodb://127.0.0.1:27017`
- Nom de base par defaut: `tp1`

Variables d'environnement possibles:

- `MONGO_URI`
- `DB_NAME`
- `JWT_SECRET`
- `PORT`

## Routes disponibles

### Auth

- `POST /auth/signup`
- `POST /auth/login`

Body JSON:

```json
{
  "email": "test@example.com",
  "password": "motdepasse"
}
```

### Teams (protegees par JWT)

- `GET /teams`
- `GET /teams/:id`
- `POST /teams`
- `PUT /teams/:id`
- `DELETE /teams/:id`

Header obligatoire:

```text
Authorization: Bearer <token>
```

Body JSON pour `POST`/`PUT`:

```json
{
  "name": "PSG",
  "country": "France"
}
```

### Players (protegees par JWT)

- `GET /players` — tous les joueurs
- `GET /players/:id` — joueur par id
- `POST /players` — creer un joueur
- `PUT /players/:id` — modifier un joueur
- `DELETE /players/:id` — supprimer un joueur
- `GET /players/team/:idTeam` — joueurs d'une equipe
- `GET /players/:id/team` — equipe d'un joueur
- `GET /players/search?name=...` — recherche par name

Body JSON pour `POST`/`PUT`:

```json
{
  "name": "Kylian Mbappe",
  "post": "Attaquant",
  "idTeam": 1,
  "number": 7
}
```

## MongoDB Compass

Connexion Compass:

```text
mongodb://127.0.0.1:27017
```

Base utilisee: `tp1`
Collections:

- `users`
- `teams`
- `players`

## Tests Postman

Base URL:

```text
http://localhost:3000
```

### 1) Creer un utilisateur (signup)

- Method: POST
- URL: http://localhost:3000/auth/signup
- Headers:
  - Content-Type: application/json
- Body (raw JSON):

```json
{
  "email": "test@example.com",
  "password": "motdepasse123"
}
```

Reponse attendue: 201

### 2) Se connecter (login)

- Method: POST
- URL: http://localhost:3000/auth/login
- Headers:
  - Content-Type: application/json
- Body (raw JSON):

```json
{
  "email": "test@example.com",
  "password": "motdepasse123"
}
```

Reponse attendue: 200 avec un token JWT.

Exemple de reponse:

```json
{
  "userId": "...",
  "token": "eyJ..."
}
```

Copier la valeur de token pour les routes suivantes.

### 3) Recuperer toutes les equipes

- Method: GET
- URL: http://localhost:3000/teams
- Headers:
  - Authorization: Bearer TON_TOKEN

Reponse attendue: 200

### 4) Recuperer une equipe par id

- Method: GET
- URL: http://localhost:3000/teams/1
- Headers:
  - Authorization: Bearer TON_TOKEN

Reponse attendue: 200 si l'id existe, sinon 404.

### 5) Creer une equipe

- Method: POST
- URL: http://localhost:3000/teams
- Headers:
  - Authorization: Bearer TON_TOKEN
  - Content-Type: application/json
- Body (raw JSON):

```json
{
  "name": "PSG",
  "country": "France"
}
```

Reponse attendue: 201

### 6) Modifier une equipe

- Method: PUT
- URL: http://localhost:3000/teams/1
- Headers:
  - Authorization: Bearer TON_TOKEN
  - Content-Type: application/json
- Body (raw JSON):

```json
{
  "name": "Paris Saint-Germain",
  "country": "France"
}
```

Reponse attendue: 200 si l'id existe, sinon 404.

### 7) Supprimer une equipe

- Method: DELETE
- URL: http://localhost:3000/teams/1
- Headers:
  - Authorization: Bearer TON_TOKEN

Reponse attendue: 204 si l'id existe, sinon 404.

### 8) Recuperer tous les joueurs

- Method: GET
- URL: http://localhost:3000/players
- Headers:
  - Authorization: Bearer TON_TOKEN

### 9) Recuperer un joueur par id

- Method: GET
- URL: http://localhost:3000/players/1
- Headers:
  - Authorization: Bearer TON_TOKEN

### 10) Creer un joueur

- Method: POST
- URL: http://localhost:3000/players
- Headers:
  - Authorization: Bearer TON_TOKEN
  - Content-Type: application/json
- Body (raw JSON):

```json
{
  "name": "Kylian Mbappe",
  "post": "Attaquant",
  "idTeam": 1,
  "number": 7
}
```

Reponse attendue: 201

### 11) Modifier un joueur

- Method: PUT
- URL: http://localhost:3000/players/1
- Headers:
  - Authorization: Bearer TON_TOKEN
  - Content-Type: application/json
- Body (raw JSON):

```json
{
  "name": "Kylian Mbappe",
  "post": "Attaquant",
  "idTeam": 1,
  "number": 10
}
```

Reponse attendue: 200 si l'id existe, sinon 404.

### 12) Supprimer un joueur

- Method: DELETE
- URL: http://localhost:3000/players/1
- Headers:
  - Authorization: Bearer TON_TOKEN

Reponse attendue: 204 si l'id existe, sinon 404.

### 13) Joueurs d'une equipe

- Method: GET
- URL: http://localhost:3000/players/team/1
- Headers:
  - Authorization: Bearer TON_TOKEN

### 14) Equipe d'un joueur

- Method: GET
- URL: http://localhost:3000/players/1/team
- Headers:
  - Authorization: Bearer TON_TOKEN

### 15) Recherche par name

- Method: GET
- URL: http://localhost:3000/players/search?name=mbappe
- Headers:
  - Authorization: Bearer TON_TOKEN

