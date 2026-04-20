const express = require('express');
const playerController = require('../controllers/playerController');

const router = express.Router();

router.get('/search', playerController.searchPlayersByNom);
router.get('/team/:idTeam', playerController.getPlayersByTeam);
router.get('/:id/team', playerController.getTeamByPlayer);
router.get('/', playerController.getAllPlayers);
router.get('/:id', playerController.getPlayerById);
router.post('/', playerController.createPlayer);
router.put('/:id', playerController.updatePlayer);
router.delete('/:id', playerController.deletePlayer);

module.exports = router;
