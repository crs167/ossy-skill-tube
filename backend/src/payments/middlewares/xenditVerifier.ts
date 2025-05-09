import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export function verifyXenditWebhook(secret: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const sig = req.headers['x-callback-signature'] as string;
    const raw = (req as any).rawBody as Buffer;
    const computed = crypto
      .createHmac('sha256', secret)
      .update(raw)
      .digest('hex');

    if (computed !== sig) {
      return res.status(400).send('Invalid Xendit signature');
    }
    next();
  };
}
