import dynamic from "next/dynamic";
import * as anchor from "@project-serum/anchor";
import { HelloWorld } from "~/types/hello_world";
import idl from "~/idl/hello_world.json";

// Hooks to access the connected wallet and network connection.
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,

  { ssr: false }
);

const Content: React.FC = () => {
  const wallet = useAnchorWallet();
  const connection = useConnection();

  const [program, setProgram] = useState<anchor.Program<HelloWorld>>(null!);

  // Searching and displaying accounts
  const [account, setAccount] = useState<{
    publicKey: anchor.web3.PublicKey;
    dataset: any;
  }>(null!);

  const getAllAccountsByAuthority = async (
    accounts: anchor.AccountClient<HelloWorld>,
    authority: anchor.web3.PublicKey
  ) => {
    return await accounts.all([
      {
        memcmp: {
          offset: 8,
          bytes: authority.toBase58(),
        },
      },
    ]);
  };

  // Const setvalue
  const [setValue, setSetValue] = useState<number>(0);

  const setAccountCounter = async () => {
    await program.methods
      .set(new anchor.BN(setValue))
      .accounts({ myAccount: account.publicKey, authority: wallet!.publicKey })
      .rpc();

    setAccount({
      publicKey: account.publicKey,
      dataset: await program.account.myAccount.fetch(account.publicKey),
    });
  };

  useEffect(() => {
    // If Connection && Wallet are available
    if (wallet && connection) {
      // Create a client side object, Connection, Provider and Program
      // we would normally get these from the Anchor.toml file
      const anchorConnection = new anchor.web3.Connection(
        connection.connection.rpcEndpoint,
        connection.connection.commitment
      );

      const anchorProvider = new anchor.AnchorProvider(
        anchorConnection,
        wallet,
        { preflightCommitment: connection.connection.commitment }
      );
      // Program Client Object, requires IDL, Smart Contract ID, and the Provider
      // Typically you would hide the smart contract id inside an .env variable
      const _program = new anchor.Program<HelloWorld>(
        JSON.parse(JSON.stringify(idl)),
        "2MVfj8ghRjjioXeW7rBAUHvWjTDQuw8WJqZAvQaJJAED",
        anchorProvider
      );

      // Search for existing accounts
      getAllAccountsByAuthority(
        _program.account.myAccount,
        wallet.publicKey
      ).then((result) => {
        if (result.length > 0) {
          setAccount({
            publicKey: result[0]!.publicKey,
            dataset: result[0]?.account,
          });
        }
      });
      setProgram(_program);
    }
  }, [wallet, connection]);

  // Initializing accounts
  const initAccount = async () => {
    console.log("test");
    // Check if program or wallet is not null
    if (!program || !wallet) {
      console.error("Program or wallet is not initialized");
      return;
    }

    const _account = anchor.web3.Keypair.generate();

    try {
      await program.methods
        .initialize()
        .accounts({
          myAccount: _account.publicKey,
          authority: wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([_account])
        .rpc();

      const fetchedAccount = await program.account.myAccount.fetch(
        _account.publicKey
      );

      setAccount({
        publicKey: _account.publicKey,
        dataset: fetchedAccount,
      });
    } catch (error) {
      console.error("Error initializing account:", error);
    }
  };

  // Increasing accounts
  const increaseAccountCounter = async () => {
    await program.methods
      .increase()
      .accounts({ myAccount: account!.publicKey, authority: wallet!.publicKey })
      .rpc();

    setAccount({
      publicKey: account.publicKey,
      dataset: await program.account.myAccount.fetch(account.publicKey),
    });
  };

  // Decrease accounts
  const decreaseAccountCounter = async () => {
    await program.methods
      .decrease()
      .accounts({ myAccount: account!.publicKey, authority: wallet!.publicKey })
      .rpc();

    setAccount({
      publicKey: account.publicKey,
      dataset: await program.account.myAccount.fetch(account.publicKey),
    });
  };
  return (
    <div className="flex flex-col items-center">
      <h1 className="mb-4 text-center text-4xl font-bold text-white">
        {" "}
        Solana Counter on Devnet
      </h1>
      <WalletMultiButtonDynamic />
      {wallet && connection ? (
        <div>
          <div className="text-white">
            <div className=" p-8 text-2xl font-bold">
              {account ? (
                <div>
                  <div className="text-center text-4xl">Counter</div>
                  <div className="text-center text-8xl">
                    {account.dataset.data.toString()}
                  </div>
                </div>
              ) : (
                <button
                  onClick={initAccount}
                  className="m-4 rounded-md border  px-12 text-white hover:bg-white hover:text-black"
                >
                  Initialize
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center">
            {account ? (
              <div className="font-bold">
                <div className=" m-4 rounded-md border  px-12 text-white hover:bg-white hover:text-black">
                  <button onClick={increaseAccountCounter}>Increase</button>
                </div>
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
      ) : (
        ""
      )}

      {account && account.dataset.data.gt(new anchor.BN(0)) ? (
        <div>
          <div className=" m-4 rounded-md border  px-12 font-bold text-white hover:bg-white hover:text-black">
            <button onClick={decreaseAccountCounter}>Decrease</button>
          </div>
        </div>
      ) : (
        ""
      )}

      {account ? (
        <div className="flex flex-col">
          <label
            htmlFor="custom-input-number"
            className="w-full text-sm font-semibold text-white"
          >
            Counter Input
          </label>
          <input
            type="number"
            min={0}
            value={setValue}
            onChange={(evt) => setSetValue(Number(evt.target.value))}
            className="block rounded-lg border border-gray-300 bg-gray-50 p-1 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          ></input>
          <button
            onClick={setAccountCounter}
            className="my-4 items-center rounded-md border text-center font-bold text-white hover:bg-white hover:text-black"
          >
            Set Number
          </button>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default Content;
