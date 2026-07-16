import {Router} from 'express';import {create,detail,list,update} from '../controllers/restaurantController.js';import {authorize,protect} from '../middleware/auth.js';
const router=Router();router.get('/',list);router.get('/:slug',detail);router.post('/',protect,authorize('partner','admin'),create);router.patch('/:id',protect,authorize('partner','admin'),update);export default router;
