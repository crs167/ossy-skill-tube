import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export function verifyPaymongoWebhook(secret: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const sig = req.headers['paymongo-signature'] as string;
    const raw = (req as any).rawBody as Buffer;
    const computed = crypto
      .createHmac('sha256', secret)
      .update(raw)
      .digest('base64');

    if (computed !== sig) {
      return res.status(400).send('Invalid PayMongo signature');
    }
    next();
  };
}
