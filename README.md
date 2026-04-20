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

## Explication du code

### config/database.js

Gere la connexion a MongoDB via le driver officiel. La fonction `connectDatabase()` est appelee au demarrage du serveur (`index.js`). Elle etablit la connexion et cree les index uniques sur `teams.id` et `users.email`. La fonction `getDb()` est utilisee dans les models pour recuperer l'instance de base de donnees.

### middlewares/authMiddleware.js

Protege les routes sensibles. Il lit le header `Authorization: Bearer <token>`, verifie la signature du JWT avec `jsonwebtoken`, et attache `req.auth.userId` si le token est valide. Si le token est absent ou invalide, il renvoie un `401`. Ce middleware est applique a toutes les routes `/teams` et `/players` dans `app.js`.

### models/

Chaque model expose des fonctions d'acces a MongoDB pour une collection donnee. Aucune logique metier ici, uniquement des requetes :

- `findAll()` : retourne tous les documents tries par `id`.
- `findById(id)` : cherche un document par son `id` numerique.
- `create(doc)` : insere un document et le retourne.
- `getNextId()` : calcule le prochain `id` en prenant le max existant + 1.
- `updateById(id, values)` : met a jour via `updateOne` et retourne le document modifie avec `findOne`. Retourne `null` si aucun document ne correspond.
- `deleteById(id)` : supprime un document et retourne le resultat (contient `deletedCount`).

Pour les joueurs, deux fonctions supplementaires :

- `findByTeamId(idTeam)` : filtre les joueurs par equipe.
- `findByNom(name)` : recherche insensible a la casse via une regex MongoDB (`$regex`, `$options: 'i'`).

### controllers/

Contiennent la logique metier. Chaque fonction :

1. Parse et normalise les donnees de la requete (conversion en nombre avec `parseInt`, trim des chaines).
2. Valide les champs obligatoires et renvoie un `400` si incomplet.
3. Appelle le model et renvoie un `404` si la ressource n'existe pas.
4. Renvoie la reponse JSON avec le bon code HTTP (`200`, `201`, `204`).
5. Passe les erreurs imprevisibles a `next(error)` pour le gestionnaire global.

Pour les joueurs, le controller verifie aussi que l'equipe (`idTeam`) existe avant de creer ou modifier un joueur.

Les routes speciales joueurs :

- `GET /players/team/:idTeam` : verifie que l'equipe existe, puis retourne tous les joueurs de cette equipe.
- `GET /players/:id/team` : recupere le joueur, puis recupere son equipe via `player.idTeam`.
- `GET /players/search?name=...` : passe le parametre `name` a `findByNom` qui fait une recherche regex.

### routes/

Fichiers de mapping URL vers les fonctions du controller. Les routes `/search` et `/team/:idTeam` sont declarees avant `/:id` pour eviter qu'Express les interprete comme un id.

### app.js

Point d'entree de l'application Express. Enregistre le middleware JSON (`express.json()`), monte les routeurs sur leurs prefixes (`/auth`, `/teams`, `/players`) avec le middleware d'authentification pour les routes protegees, et definit le gestionnaire d'erreurs global.


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

