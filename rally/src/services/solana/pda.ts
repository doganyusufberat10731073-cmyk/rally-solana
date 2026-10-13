import { PublicKey } from '@solana/web3.js';
import { Buffer } from 'buffer';
import { IDL } from './rally';

export const PROGRAM_ID = new PublicKey('DkzLzgXKWj6yXkBYbEJEfP9ZSeQgcJjYs2e4hGueEPaW');

export const getActivityPda = (creator: PublicKey, activityId: bigint): PublicKey => {
  const buffer = new ArrayBuffer(8);
  new DataView(buffer).setBigUint64(0, activityId, true);

  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('activity'),
      creator.toBuffer(),
      new Uint8Array(buffer),
    ],
    PROGRAM_ID
  );
  return pda;
};

export const getParticipantPda = (activityPda: PublicKey, user: PublicKey): PublicKey => {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('participant'),
      activityPda.toBuffer(),
      user.toBuffer(),
    ],
    PROGRAM_ID
  );
  return pda;
};
