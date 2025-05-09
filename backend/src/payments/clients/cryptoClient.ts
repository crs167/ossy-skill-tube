import { JsonRpcProvider, Wallet } from 'ethers';
const provider = new JsonRpcProvider(process.env.ETH_RPC_URL);
const wallet = new Wallet(process.env.PRIVATE_KEY!, provider);

export async function sendCrypto(to: string, amountWei: string) {
  const tx = await wallet.sendTransaction({ to, value: amountWei });
  return tx.wait();
}
