const {
  LAMPORTS_PER_SOL,
  SYSVAR_CLOCK_PUBKEY,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
  Connection,
  PublicKey,
  Keypair,
} = require("@solana/web3.js");
const borsh = require("@coral-xyz/borsh");

(async () => {
  try {
    const connection = new Connection("http://127.0.0.1:8899", "confirmed");
    const programId = new PublicKey(
      "3J8uEq378ZzW89qNkwuePgKMW8fMck8EtG52e7bJNhXC"
    );
    // const metaplex = new Metaplex(connection);
    // const abortController = new AbortController();
    // setTimeout(() => abortController.abort(), 100);

    // // const umi = createUmi("https://api.mainnet-beta.solana.com");
    // const umi = createUmi("https://api.devnet.solana.com").use(
    //   mplCandyMachine()
    // );
    // const candyMachinePublicKey = publicKey(
    //   "BCFQQiqLDEwmg7uM1TAKweMHM6GWtUvrwxUdZKZ8WWfC"
    // );
    // const candyMachine = await fetchCandyMachine(umi, candyMachinePublicKey); // Pass the AbortController's signal to the operation.
    // const items = candyMachine.items;
    // const mintAddress = items[0];
    // console.log("mintAddress", mintAddress, typeof mintAddress);
    // // const nft = await metaplex.nfts().findByMint(
    // //   {
    // //     mintAddress,
    // //   },
    // //   {
    // //     signal: abortController.signal,
    // //   }
    // // );
    // const nftURI = candyMachine.items[0].uri;
    // console.log("nftURI", nftURI);

    // // NFT
    // // Create Umi Instance

    // // Import your private key file and parse it.
    // const wallet = "../src/target/deploy/solana-keypair.json";
    // const secretKey = [
    //   114, 20, 209, 136, 123, 142, 2, 51, 34, 147, 218, 49, 223, 40, 97, 127,
    //   24, 135, 122, 117, 235, 242, 170, 246, 51, 7, 196, 87, 67, 113, 211, 54,
    //   219, 220, 61, 242, 67, 172, 42, 50, 239, 71, 194, 71, 142, 77, 16, 152,
    //   176, 88, 223, 39, 220, 77, 166, 211, 126, 7, 56, 249, 57, 83, 146, 64,
    // ];

    // // Create a keypair from your private key
    // const keypair = umi.eddsa.createKeypairFromSecretKey(
    //   new Uint8Array(secretKey)
    // );

    // // Register it to the Umi client.
    // umi.use(keypairIdentity(keypair));
    // // Register it to the Umi client.
    // umi.use(keypairIdentity(keypair));
    // umi.use(mplTokenMetadata()).use(
    //   nftStorageUploader({
    //     token: "ed4f515a.f240b5d35cd8435fa57775ea110f1b14",
    //   })
    // );

    // //KeypairSigner ?
    // const mint = generateSigner(umi);

    // const asset = await fetchDigitalAsset(umi, mint.publicKey);
    // console.log("asset", asset);
    const signer = Keypair.generate();
    const pda = Keypair.generate();

    const crudInstructionStruct = borsh.struct([
      borsh.u8("variant"),
      borsh.u8("id"),
      borsh.str("title"),
      borsh.str("body"),
    ]);

    let buffer = Buffer.alloc(1000);
    crudInstructionStruct.encode(
      {
        variant: 0,
        id: 10,
        title: "My TODO Title",
        body: "Lorem ipsum asa dasa.",
      },
      buffer
    );
    const instructionBuffer = buffer.slice(
      0,
      crudInstructionStruct.getSpan(buffer)
    );

    // const instructionBuffer = Uint8Array.prototype.slice(
    //   0,
    //   createTodoStruct.getSpan(buffer)
    // );

    const airdropRequest = await connection.requestAirdrop(
      signer.publicKey,
      LAMPORTS_PER_SOL
    );
    const latestBlockHash = await connection.getLatestBlockhash();
    // @ts-ignore
    await connection.confirmTransaction({
      signature: airdropRequest,
      blockhash: latestBlockHash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    });

    const signerAccount = Keypair.generate();
    const transaction = new Transaction();
    const instruction = new TransactionInstruction({
      keys: [
        {
          pubkey: signer.publicKey,
          isSigner: true,
          isWritable: false,
        },
        {
          pubkey: pda.publicKey,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: SystemProgram.programId,
          isSigner: false,
          isWritable: false,
        },
      ],
      programId: programId,
      data: instructionBuffer,
    });

    transaction.add(instruction);
    console.log("sending tx");
    const txHash = await sendAndConfirmTransaction(connection, transaction, [
      signer,
    ]).then((txid) => {
      console.log(
        `Transaction submittedz: https://explorer.solana.com/tx/${txid}?cluster=devnet`
      );
    });

    // console.log("Transaction sent with hash:", txHash);
  } catch (e) {
    console.log("e", e);
  }
})();
