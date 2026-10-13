import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { IDL } from '../services/solana/rally';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';

export const useRallyProgram = () => {
  const { connection } = useConnection();
  const adapterWallet = useAnchorWallet();

  const wallet = useMemo(() => {
    if (adapterWallet) return adapterWallet;
    if (typeof window !== 'undefined') {
      const sol = (window as any).solana;
      if (sol?.publicKey) {
        return {
          publicKey: new PublicKey(sol.publicKey.toString()),
          signTransaction: sol.signTransaction
            ? sol.signTransaction.bind(sol)
            : async (tx: any) => tx,
          signAllTransactions: sol.signAllTransactions
            ? sol.signAllTransactions.bind(sol)
            : async (txs: any[]) => txs,
        };
      }
    }
    return null;
  }, [adapterWallet]);

  const program = useMemo(() => {
    if (!wallet) return null;
    const provider = new AnchorProvider(connection, wallet as any, AnchorProvider.defaultOptions());
    return new Program(IDL, provider);
  }, [connection, wallet]);

  return { program, connection, wallet };
};