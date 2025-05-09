import { Router } from 'express';
import {
  createPaymentIntent,
  handlePaymentCompleted,
} from './controllers/paymentController';
import { verifyXenditWebhook } from './middlewares/xenditVerifier';
import { verifyPaymongoWebhook } from './middlewares/paymongoVerifier';

const router = Router();

router.post('/create-intent', createPaymentIntent);

router.post(
  '/webhook/xendit',
  verifyXenditWebhook(process.env.XENDIT_WEBHOOK_SECRET!),
  async (req, res) => {
    await handlePaymentCompleted('xendit', req.body);
    res.json({ received: true });
  }
);

router.post(
  '/webhook/paymongo',
  verifyPaymongoWebhook(process.env.PAYMONGO_WEBHOOK_SECRET!),
  async (req, res) => {
    await handlePaymentCompleted('paymongo', req.body);
    res.json({ received: true });
  }
);

export default router;
