import fetch from 'node-fetch';
const API = 'https://api.paymongo.com/v1';
const auth = Buffer.from(process.env.PAYMONGO_SECRET_KEY!).toString('base64');

export async function createPaymongoCharge(
  amount: number,
  currency: string,
  sourceType: string,
  details: Record<string, string>
) {
  const body = {
    data: {
      attributes: {
        amount,
        currency,
        source: { type: sourceType, ...details },
        description: 'Video purchase',
      },
    },
  };
  const res = await fetch(`${API}/payments`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return res.json();
}
