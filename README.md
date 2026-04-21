# TP1 - DEVOPS - M1 DEV

## Introduction

L'objectif de ce TP est de concevoir et developper une API REST complete en suivant les bonnes pratiques DevOps et de developpement backend. Le sujet porte sur la gestion d'equipes et de joueurs de football, avec un systeme d'authentification securise par JSON Web Token (JWT).

Le but est de mettre en pratique la connexion a une base de donnees NoSQL (MongoDB), la securisation des routes via un middleware d'authentification, et la validation des donnees entrantes. Le tout est documente et teste via Postman pour garantir le bon fonctionnement de chaque endpoint.

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

Réponse dans postman

![alt text](docs/images/image.png)


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
Réponse dans postman : 
![alt text](docs/images/image-1.png)

Réponse en cas de mauvais identifiants : 
![alt text](docs/images/image-2.png)

Copier la valeur de token pour les routes suivantes.


### 3) Recuperer toutes les equipes

- Method: GET
- URL: http://localhost:3000/teams
- Headers:
  - Authorization: Bearer TON_TOKEN

Reponse attendue: 200

Réponse dans postman : 
![alt text](docs/images/image-3.png)
### 4) Recuperer une equipe par id

- Method: GET
- URL: http://localhost:3000/teams/1
- Headers:
  - Authorization: Bearer TON_TOKEN

Reponse attendue: 200 si l'id existe, sinon 404.

Réponse dans postman : 
![alt text](docs/images/image-4.png)

Réponse avec un mauvais id : 
![alt text](docs/images/image-5.png)

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

Réponse dans postman : 
![alt text](docs/images/image-6.png)

Réponse avec mauvaise requete : 
![alt text](docs/images/image-7.png)

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
Réponse dans postman : 
![alt text](docs/images/image-8.png)

Réponse si mauvais id : 
![alt text](docs/images/image-9.png)


### 7) Supprimer une equipe

- Method: DELETE
- URL: http://localhost:3000/teams/1
- Headers:
  - Authorization: Bearer TON_TOKEN

Reponse attendue: 204 si l'id existe, sinon 404.

Réponse postman : 
![alt text](docs/images/image-10.png)

Réponse si mauvais id : 
![alt text](docs/images/image-11.png)

### 8) Recuperer tous les joueurs

- Method: GET
- URL: http://localhost:3000/players
- Headers:
  - Authorization: Bearer TON_TOKEN
  
Réponse Postman : 
![alt text](docs/images/image-12.png)

### 9) Recuperer un joueur par id

- Method: GET
- URL: http://localhost:3000/players/1
- Headers:
  - Authorization: Bearer TON_TOKEN

Réponse postman : 
![alt text](docs/images/image-13.png)

### 10) Creer un joueur

- Method: POST
- URL: http://localhost:3000/players
- Headers:
  - Authorization: Bearer TON_TOKEN
  - Content-Type: application/json
- Body (raw JSON):

```json
{
  "name": "Dembelle",
  "post": "Attaquant",
  "idTeam": 11,
  "number": 11
}
```

Reponse attendue: 201

Réponse postman :
![alt text](docs/images/image-14.png)

Réponse si l'équipe n'existe pas : 
![alt text](docs/images/image-18.png)

### 11) Modifier un joueur

- Method: PUT
- URL: http://localhost:3000/players/1
- Headers:
  - Authorization: Bearer TON_TOKEN
  - Content-Type: application/json
- Body (raw JSON):

```json
{
  "name": "Dembelle",
  "post": "Attaquant",
  "idTeam": 11,
  "number": 11
}
```
Reponse attendue: 200 si l'id existe, sinon 404.

Réponse postman : 
![alt text](docs/images/image-15.png)

Réponse si le joueur n'existe pas : 
![alt text](docs/images/image-16.png)

Réponse si l'équipe n'existe pas : 
![alt text](docs/images/image-17.png)

### 12) Supprimer un joueur

- Method: DELETE
- URL: http://localhost:3000/players/1
- Headers:
  - Authorization: Bearer TON_TOKEN

Reponse attendue: 204 si l'id existe, sinon 404.

Réponse postman : 

Réponse si le joueur n'existe pas : 


### 13) Joueurs d'une equipe

- Method: GET
- URL: http://localhost:3000/players/team/1
- Headers:
  - Authorization: Bearer TON_TOKEN

Réponse postman : 
![alt text](docs/images/image-19.png)

Réponse si l'équipe n'existe pas : 
![alt text](docs/images/image-20.png)

### 14) Equipe d'un joueur

- Method: GET
- URL: http://localhost:3000/players/1/team
- Headers:
  - Authorization: Bearer TON_TOKEN

Réponse postman : 
![alt text](docs/images/image-21.png)

Réponse si le joueur n'existe pas : 
![alt text](docs/images/image-22.png)

### 15) Recherche par name

- Method: GET
- URL: http://localhost:3000/players/search?name=mbappe
- Headers:
  - Authorization: Bearer TON_TOKEN

Réponse postman : 
![alt text](docs/images/image-23.png)

## Conclusion

Ce TP m'a permis de consolider plusieurs competences cles du developpement backend et des pratiques DevOps.

La mise en place de l'authentification JWT m'a permis de comprendre concretement le cycle de vie d'un token : creation lors du login, transmission via le header `Authorization`, et verification par un middleware avant chaque requete protegee. J'ai egalement pris en main le driver officiel MongoDB (sans ORM), ce qui m'a donne une vision plus precise de ce qui se passe au niveau des requetes en base de donnees.

Enfin, la phase de tests avec Postman m'a appris l'importance de couvrir non seulement les cas nominaux (ressource trouvee, creation reussie), mais aussi les cas d'erreur (ressource inexistante, champs manquants, mauvais token), afin de garantir la robustesse de l'API.