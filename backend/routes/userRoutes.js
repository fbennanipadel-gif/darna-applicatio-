import { Router } from 'express';
import { favorites, toggleFavorite, updateMe, myReviews, loyalty } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);
router.get('/favorites', favorites);
router.post('/favorites/toggle', toggleFavorite);
router.patch('/me', updateMe);
router.get('/me/reviews', myReviews);
router.get('/me/loyalty', loyalty);

export default router;
