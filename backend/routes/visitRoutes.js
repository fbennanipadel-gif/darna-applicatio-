import {Router} from 'express';import {history,review,verify} from '../controllers/visitController.js';import {protect} from '../middleware/auth.js';
const router=Router();router.use(protect);router.post('/verify',verify);router.get('/history',history);router.post('/reviews',review);export default router;
