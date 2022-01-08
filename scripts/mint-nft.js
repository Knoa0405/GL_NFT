require('dotenv').config();

const META_MASK_PUBLIC_KEY = process.env.META_MASK_PUBLIC_KEY;
const META_MASK_PRIVATE_KEY = process.env.META_MASK_PRIVATE_KEY;
const API_URL = process.env.API_URL;

const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const alchemyWeb3 = createAlchemyWeb3(API_URL);
const contract = require("../artifacts/contracts/GlitteringNFT.sol/NaNFT.json");

const contractAddress = "0xc6ED1371722EB2aE8236a380C47d7fc548Fb6806";
const nftContract = new alchemyWeb3.eth.Contract(contract.abi, contractAddress);

async function mintNFT(tokenURI) {
    // get the nonce - nonce is needed for security reasons. It keeps track of the number of
    // transactions sent from our address and prevents replay attacks.
  const nonce = await alchemyWeb3.eth.getTransactionCount(META_MASK_PUBLIC_KEY, 'latest');
  const tx = {
    from: META_MASK_PUBLIC_KEY, // our MetaMask public key
    to: contractAddress, // the smart contract address we want to interact with
    nonce: nonce, // nonce with the no of transactions from our account
    gas: 1000000, // fee estimate to complete the transaction
    data: nftContract.methods
      .createNFT(META_MASK_PUBLIC_KEY, tokenURI) // createNFT first parameter => receiver's address ( public key or address )
      .encodeABI(), // call the createNFT function from our NaNFT.sol file and pass the account that should receive the minted NFT.
  };
  // Make signed transaction for make NFT
  // ( tx ( readonly initial Settings for update NFT information ) + meta_mask_private_key ( contract owner master key ) ) 
  // for update block in blockchain network
  const signPromise = alchemyWeb3.eth.accounts.signTransaction(
    tx,
    META_MASK_PRIVATE_KEY
  );
  signPromise
    .then((signedTx) => {
      alchemyWeb3.eth.sendSignedTransaction(
        signedTx.rawTransaction,
        function (err, hash) {
          if (!err) {
            console.log(
              "The hash of our transaction is: ",
              hash,
              "\nCheck Alchemy's Mempool to view the status of our transaction!"
            );
          } else {
            console.log(
              "Something went wrong when submitting our transaction:",
              err
            );
          }
        }
      );
    })
    .catch((err) => {
      console.log(" Promise failed:", err);
    });
}

mintNFT("https://ipfs.io/ipfs/QmYF62NsYQeMXkQLAB26FQZBpRcNPcv95Qh2JcbnCAvGCU") // pass the CID to the JSON file uploaded to Pinata