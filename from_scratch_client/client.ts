import {
  Keypair,
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import * as BufferLayout from "@solana/buffer-layout";
import fs from 'mz/fs';
import path from 'path';
import { Buffer } from 'buffer';
import { GREETING_SIZE, getGreeting } from './models/greeting_schema';
import { getPayer, getRpcUrl, createKeypairFromFile } from './sol_utils';

/**
 * Connection to the network
 */
let connection: Connection;

/**
 * Keypair associated to the fees' payer
 */
let payer: Keypair;

/**
 * Hello world's program id
 */
let programId: PublicKey;

/**
 * The public key of the account we are saying hello to
 */
let greetedPubkey: PublicKey;

/**
 * Path to program files
 */
const PROGRAM_PATH = path.resolve(__dirname, '../from_scratch/dist/program');
const PROGRAM_SO_PATH = path.join(PROGRAM_PATH, 'helloworldSOL.so');
const PROGRAM_KEYPAIR_PATH = path.join(PROGRAM_PATH, 'helloworldSOL-keypair.json');

/**
 * Establish a connection to the cluster
 */
export async function establishConnection(): Promise<void> {
  const rpcUrl = await getRpcUrl();
  connection = new Connection(rpcUrl, 'confirmed');
  const version = await connection.getVersion();
  console.log('Connection to cluster established:', rpcUrl, version);
}

/**
 * Establish an account to pay for everything
 */
export async function establishPayer(): Promise<void> {
  let fees = 0;
  if (!payer) {
    const { feeCalculator } = await connection.getRecentBlockhash();

    // Calculate the cost to fund the greeter account
    fees += await connection.getMinimumBalanceForRentExemption(GREETING_SIZE);

    // Calculate the cost of sending transactions
    fees += feeCalculator.lamportsPerSignature * 100; // wag

    payer = await getPayer();
  }

  let lamports = await connection.getBalance(payer.publicKey);
  if (lamports < fees) {
    // If current balance is not enough to pay for fees, request an airdrop
    // TODO: if there are not enough fees, abort execution, return error
    const sig = await connection.requestAirdrop(
      payer.publicKey,
      fees - lamports,
    );
    await connection.confirmTransaction(sig);
    lamports = await connection.getBalance(payer.publicKey);
  }

  console.log(
    'Using account',
    payer.publicKey.toBase58(),
    'containing',
    lamports / LAMPORTS_PER_SOL,
    'SOL to pay for fees',
  );
}

/**
 * Check if the hello world BPF program has been deployed
 */
export async function checkProgram(): Promise<void> {
  // Read program id from keypair file
  try {
    const programKeypair = await createKeypairFromFile(PROGRAM_KEYPAIR_PATH);
    programId = programKeypair.publicKey;
  } catch (err) {
    const errMsg = (err as Error).message;
    throw new Error(
      `Failed to read program keypair at '${PROGRAM_KEYPAIR_PATH}' due to error: ${errMsg}. Program may need to be deployed with \`solana program deploy dist/program/helloworld.so\``,
    );
  }

  // Check if the program has been deployed
  const programInfo = await connection.getAccountInfo(programId);
  if (programInfo === null) {
    if (fs.existsSync(PROGRAM_SO_PATH)) {
      throw new Error(
        'Program needs to be deployed with `solana program deploy dist/program/helloworld.so`',
      );
    } else {
      throw new Error('Program needs to be built and deployed');
    }
  } else if (!programInfo.executable) {
    throw new Error(`Program is not executable`);
  }
  console.log(`Using program ${programId.toBase58()}`);

  // Derive the address (public key) of a greeting account from the program so that it's easy to find later.
  const GREETING_SEED = 'hello';
  greetedPubkey = await PublicKey.createWithSeed(
    payer.publicKey,
    GREETING_SEED,
    programId,
  );

  // Check if the greeting account has already been created
  const greetedAccount = await connection.getAccountInfo(greetedPubkey);
  if (greetedAccount === null) {
    console.log(
      'Creating account',
      greetedPubkey.toBase58(),
      'to say hello to',
    );
    const lamports = await connection.getMinimumBalanceForRentExemption(
      GREETING_SIZE,
    );

    const transaction = new Transaction().add(
      SystemProgram.createAccountWithSeed({
        fromPubkey: payer.publicKey,
        basePubkey: payer.publicKey,
        seed: GREETING_SEED,
        newAccountPubkey: greetedPubkey,
        lamports,
        space: GREETING_SIZE,
        programId,
      }),
    );
    await sendAndConfirmTransaction(connection, transaction, [payer]);
  }
}
function createIncrementInstruction(): Buffer {
  const layout = BufferLayout.struct([BufferLayout.u8('instruction')]);
  const data = Buffer.alloc(layout.span);
  layout.encode({ instruction: 0 }, data);
  return data;
}
function createSetNameInstruction(): Buffer {
  const layout = BufferLayout.struct([
    BufferLayout.u8('instruction'),
    new BufferLayout.CString('value')]);
  const data = Buffer.alloc(layout.span);
  layout.encode({ instruction: 1, value: "hello" }, data);
  return data;
}

function createSetAgeInstruction(age: number): Buffer {
  const layout = BufferLayout.struct([
    BufferLayout.u8('instruction'),
    BufferLayout.u32('value')
  ]);
  const data = Buffer.alloc(layout.span);
  layout.encode({ instruction: 2, value: age }, data);
  return data;
}

/**
 * Say hello
 */
export async function sayHello(age: number): Promise<void> {
  console.log('Saying hello to', greetedPubkey.toBase58());
  const instruction = new TransactionInstruction({
    keys: [{ pubkey: greetedPubkey, isSigner: false, isWritable: true }],
    programId,
    data: createSetAgeInstruction(age), // All instructions are hellos
  });
  await sendAndConfirmTransaction(
    connection,
    new Transaction().add(instruction),
    [payer],
  );
}

/**
 * Report the number of times the greeted account has been said hello to
 */
export async function reportGreetings(): Promise<void> {
  const accountInfo = await connection.getAccountInfo(greetedPubkey);
  if (accountInfo === null) {
    throw 'Error: cannot find the greeted account';
  }
  const greeting = getGreeting(accountInfo);
  console.log(
    greetedPubkey.toBase58(),
    'has been greeted',
    greeting.counter,
    'time(s)',
  );
}

export async function mintNFTforSneaker(
  creatorPubKey: PublicKey,
  seed: String,
  amount: number
): Promise<number> {
  if(creatorPubKey === null){
    // create wallet for creator and set to creatorPubKey
  }
  
  // send nft(s) to creatorPubKey after minting
  return 0
}

export async function transferNFT(
  nft: PublicKey,
  from: PublicKey,
  to: PublicKey
): Promise<number> {

  // from will have to pay the fees since to might be null
  if (to === null) {
    // create a new wallet and assign "to"
  }

  // call transfer NFT instruction. This instruction 
  // will complete transfer then create new NFT for bought?

  return 0
}