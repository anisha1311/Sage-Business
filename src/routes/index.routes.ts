import { Router } from 'express';
import QBAuthRouter from './myob-data.route';
import MYOBRouter from './myob-auth.route'

const router = Router();

router.use('/qb', QBAuthRouter);
//router.use('/qb', QBRouter);
router.use('/', MYOBRouter);
export default router;
