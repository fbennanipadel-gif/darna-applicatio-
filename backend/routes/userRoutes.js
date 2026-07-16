import {Router} from 'express';import {favorites,toggleFavorite} from '../controllers/userController.js';import {protect} from '../middleware/auth.js';
const router=Router();router.use(protect);router.get('/favorites',favorites);router.post('/favorites/toggle',toggleFavorite);export default router;
