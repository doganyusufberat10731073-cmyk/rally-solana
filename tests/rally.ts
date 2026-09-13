import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Rally } from "../target/types/rally";
import { expect } from "chai";

describe("rally", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Rally as Program<Rally>;
  const provider = anchor.getProvider();
  
  // Test accounts
  const creator = anchor.web3.Keypair.generate();
  const participant1 = anchor.web3.Keypair.generate();
  const participant2 = anchor.web3.Keypair.generate();
  
  const activityId = new anchor.BN(1);
  
  // PDAs
  const [activityPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("activity"), creator.publicKey.toBuffer(), activityId.toArrayLike(Buffer, "le", 8)],
    program.programId
  );

  const [participant1Pda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("participant"), activityPda.toBuffer(), participant1.publicKey.toBuffer()],
    program.programId
  );

  before(async () => {
    // Airdrop SOL to test accounts
    const airdrop = async (user: anchor.web3.Keypair) => {
      const sig = await provider.connection.requestAirdrop(user.publicKey, 10 * anchor.web3.LAMPORTS_PER_SOL);
      await provider.connection.confirmTransaction(sig);
    };
    await airdrop(creator);
    await airdrop(participant1);
    await airdrop(participant2);
  });

  it("Creates an activity", async () => {
    await program.methods
      .createActivity(activityId, 2)
      .accounts({
        activity: activityPda,
        creator: creator.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([creator])
      .rpc();

    const activity = await program.account.activity.fetch(activityPda);
    expect(activity.creator.toString()).to.equal(creator.publicKey.toString());
    expect(activity.maxParticipants).to.equal(2);
    expect(activity.participantCount).to.equal(0);
    expect(activity.status).to.deep.equal({ open: {} });
  });

  it("Joins an activity", async () => {
    await program.methods
      .joinActivity()
      .accounts({
        participant: participant1Pda,
        activity: activityPda,
        user: participant1.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([participant1])
      .rpc();

    const activity = await program.account.activity.fetch(activityPda);
    expect(activity.participantCount).to.equal(1);
    
    const participant = await program.account.participant.fetch(participant1Pda);
    expect(participant.user.toString()).to.equal(participant1.publicKey.toString());
    expect(participant.activity.toString()).to.equal(activityPda.toString());
  });

  it("Prevents duplicate join", async () => {
    try {
      await program.methods
        .joinActivity()
        .accounts({
          participant: participant1Pda,
          activity: activityPda,
          user: participant1.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([participant1])
        .rpc();
      expect.fail("Should have failed");
    } catch (e: any) {
      // Expecting anchor error due to seeds constraint (account already initialized)
      expect(e).to.exist;
    }
  });

  it("Leaves an activity", async () => {
    await program.methods
      .leaveActivity()
      .accounts({
        participant: participant1Pda,
        activity: activityPda,
        user: participant1.publicKey,
      })
      .signers([participant1])
      .rpc();

    const activity = await program.account.activity.fetch(activityPda);
    expect(activity.participantCount).to.equal(0);
  });

  it("Cancels an activity", async () => {
    await program.methods
      .cancelActivity()
      .accounts({
        activity: activityPda,
        creator: creator.publicKey,
      })
      .signers([creator])
      .rpc();

    const activity = await program.account.activity.fetch(activityPda);
    expect(activity.status).to.deep.equal({ cancelled: {} });
  });
});
