import Xendit from 'xendit-node';
const { Xendit: Xi } = Xendit;
const xi = new Xi({ secretKey: process.env.XENDIT_SECRET_KEY! });
const { Invoice } = xi;

export async function createXenditInvoice(
  amount: number,
  currency: string,
  payerEmail: string
) {
  const params = {
    externalID: `ossy-${Date.now()}`,
    amount,
    currency,
    payerEmail,
    description: 'Video purchase',
    successRedirectURL: process.env.SUCCESS_URL,
    failureRedirectURL: process.env.FAILURE_URL,
  };
  return await Invoice.createInvoice(params);
}
