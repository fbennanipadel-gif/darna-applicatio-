import { Router } from 'express';
import { create, detail, list, update, trending, recommended, createReview } from '../controllers/restaurantController.js';
import { authorize, protect, softAuth } from '../middleware/auth.js';

const router = Router();

// Specific routes must be declared before the dynamic :slug route.
router.get('/', list);
router.get('/trending', trending);
router.get('/recommended', protect, recommended);
router.get('/:slug', softAuth, detail);
router.post('/:slug/reviews', protect, createReview);
router.post('/', protect, authorize('partner', 'admin'), create);
router.patch('/:id', protect, authorize('partner', 'admin'), update);

export default router;
