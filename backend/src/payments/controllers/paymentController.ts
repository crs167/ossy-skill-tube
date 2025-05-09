import { Request, Response } from 'express';
import { createXenditInvoice } from '../clients/xenditClient';
import { createPaymongoCharge } from '../clients/paymongoClient';
import { sendCrypto } from '../clients/cryptoClient';
import { db } from '../../server';
import OceanDropClient from '../../oceandropClient';
import { log } from '../utils';

const oceandrop = new OceanDropClient({
  apiKey: process.env.OCEANDROP_API_KEY!,
  baseUrl: process.env.OCEANDROP_BASE_URL!,
});

export async function createPaymentIntent(req: Request, res: Response) {
  const {
    method,
    amount,
    currency,
    payerEmail,
    sourceType,
    details,
    videoId,
    userId,
  } = req.body;

  try {
    let result: any;

    if (method === 'xendit') {
      result = await createXenditInvoice(amount, currency, payerEmail);
    } else if (method === 'paymongo') {
      result = await createPaymongoCharge(
        amount,
        currency,
        sourceType,
        details
      );
    } else if (method === 'crypto') {
      result = await sendCrypto(details.to, details.amountWei);
    } else {
      throw new Error(`Unsupported payment method: ${method}`);
    }

    const txRef = db.collection('transactions').doc();
    await txRef.set({
      _id: txRef.id,
      userId,
      videoId,
      method,
      amount,
      currency,
      status: 'pending',
      providerResponse: result,
      createdAt: new Date(),
    });

    log(`Created ${method} payment intent for tx ${txRef.id}`);
    res.json({ success: true, data: result, transactionId: txRef.id });
  } catch (err: any) {
    log(`Error in createPaymentIntent: ${err.message}`);
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function handlePaymentCompleted(
  provider: 'xendit' | 'paymongo' | 'crypto',
  payload: any
) {
  // Extract transaction ID from payload
  const txId =
    payload.data.external_id || payload.data.attributes?.client_ref_id;
  const status = provider === 'crypto' ? 'confirmed' : 'paid';

  // Update the transaction record
  await db.collection('transactions').doc(txId).update({
    status,
    completedAt: new Date(),
    providerPayload: payload,
  });

  // Grant user access
  const tx = await db.collection('transactions').doc(txId).get();
  const { userId, videoId } = tx.data()!;
  await db
    .collection('users')
    .doc(userId)
    .collection('purchases')
    .doc(videoId)
    .set({ purchasedAt: new Date() });

  // Optionally fulfill via OceanDrop
  await oceandrop.grantAccess({ userId, videoId });

  log(
    `Payment ${txId} completed (provider=${provider}), access granted to ${userId} for ${videoId}`
  );
}
