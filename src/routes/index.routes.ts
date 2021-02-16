import { Router } from 'express';
import MYOBRouter from './myob-auth.route'

const router = Router();
router.use('/', MYOBRouter);
export default router;
