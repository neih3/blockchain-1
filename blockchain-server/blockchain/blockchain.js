const CryptoJS = require("crypto-js");
const _ = require("lodash");
const p2p = require("./p2p");
const transaction = require("./transaction");
const transactionPool = require("./transactionPool");
const util = require("./util");
const wallet = require("./wallet");
class Block {
  constructor(index, hash, previousHash, timestamp, data, difficulty, nonce) {
    this.index = index;
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.data = data;
    this.hash = hash;
    this.difficulty = difficulty;
    this.nonce = nonce;
  }
}
exports.Block = Block;
const genesisTransaction = {
  txIns: [{ signature: "", txOutId: "", txOutIndex: 0 }],
  txOuts: [
    {
      address:
        "040eadda78aeadf639be0b7c6d5a383a9851d05be14b7569f7f8291c4bd7d1e30a7014c86788d57584e17eb835b32c158a60e7191e8f5ad9d8801fa56d4baa5302",
      amount: 50,
    },
  ],
  id: "b1ee3aaf6a53fe0f64146ef56be8d85b1de0a4b7e6388c823ddf8ffc2ed40e0a",
};
const genesisBlock = new Block(
  0,
  "91a73664bc84c0baa1fc75ea6e4aa6d1d20c5df664c724e3159aefc2e1186627",
  "",
  1465154705,
  [genesisTransaction],
  0,
  0
);
let blockchain = [genesisBlock];
// the unspent txOut of genesis block is set to unspentTxOuts on startup
let unspentTxOuts = transaction.processTransactions(blockchain[0].data, [], 0);
const getBlockchain = () => blockchain;
exports.getBlockchain = getBlockchain;
const getUnspentTxOuts = () => _.cloneDeep(unspentTxOuts);
exports.getUnspentTxOuts = getUnspentTxOuts;
// and txPool should be only updated at the same time
const setUnspentTxOuts = (newUnspentTxOut) => {
  console.log("replacing unspentTxouts with: %s", newUnspentTxOut);
  unspentTxOuts = newUnspentTxOut;
};
const getLatestBlock = () => blockchain[blockchain.length - 1];
exports.getLatestBlock = getLatestBlock;
// in seconds
const BLOCK_GENERATION_INTERVAL = 10;
// in blocks
const DIFFICULTY_ADJUSTMENT_INTERVAL = 10;
const getDifficulty = (aBlockchain) => {
  const latestBlock = aBlockchain[blockchain.length - 1];
  if (
    latestBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 &&
    latestBlock.index !== 0
  ) {
    return getAdjustedDifficulty(latestBlock, aBlockchain);
  } else {
    return latestBlock.difficulty;
  }
};
const getAdjustedDifficulty = (latestBlock, aBlockchain) => {
  const prevAdjustmentBlock =
    aBlockchain[blockchain.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
  const timeExpected =
    BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
  const timeTaken = latestBlock.timestamp - prevAdjustmentBlock.timestamp;
  if (timeTaken < timeExpected / 2) {
    return prevAdjustmentBlock.difficulty + 1;
  } else if (timeTaken > timeExpected * 2) {
    // Ensure difficulty doesn't go below 0
    return Math.max(0, prevAdjustmentBlock.difficulty - 1);
  } else {
    return prevAdjustmentBlock.difficulty;
  }
};
const getCurrentTimestamp = () => Math.round(new Date().getTime() / 1000);
const generateRawNextBlock = (blockData) => {
  const previousBlock = getLatestBlock();
  const difficulty = getDifficulty(getBlockchain());
  const nextIndex = previousBlock.index + 1;
  const nextTimestamp = getCurrentTimestamp();
  const newBlock = findBlock(
    nextIndex,
    previousBlock.hash,
    nextTimestamp,
    blockData,
    difficulty
  );
  // const coinbaseTx = transaction.getCoinbaseTransaction(
  // 	wallet.getPublicFromPrivateKey(privateKey),
  // 	getLatestBlock().index + 1
  // );
  if (addBlockToChain(newBlock)) {
    p2p.broadcastLatest();
    return newBlock;
  } else {
    return null;
  }
};
exports.generateRawNextBlock = generateRawNextBlock;
// gets the unspent transaction outputs owned by the wallet
const getMyUnspentTransactionOutputs = (privateKey) => {
  return wallet.findUnspentTxOuts(
    wallet.getPublicFromPrivateKey(privateKey),
    getUnspentTxOuts()
  );
};
exports.getMyUnspentTransactionOutputs = getMyUnspentTransactionOutputs;

const generateNextBlock = (privateKey) => {
  const coinbaseTx = transaction.getCoinbaseTransaction(
    wallet.getPublicFromPrivateKey(privateKey),
    getLatestBlock().index + 1
  );
  const blockData = [coinbaseTx].concat(transactionPool.getTransactionPool());
  return generateRawNextBlock(blockData);
};

exports.generateNextBlock = generateNextBlock;

const generatenextBlockWithTransaction = (
  receiverAddress,
  amount,
  privateKey
) => {
  if (!transaction.isValidAddress(receiverAddress)) {
    throw Error("invalid address");
  }
  if (typeof amount !== "number") {
    throw Error("invalid amount");
  }
  const coinbaseTx = transaction.getCoinbaseTransaction(
    wallet.getPublicFromPrivateKey(privateKey),
    getLatestBlock().index + 1
  );
  const tx = wallet.createTransaction(
    receiverAddress,
    amount,
    privateKey,
    getUnspentTxOuts(),
    transactionPool.getTransactionPool()
  );
  const blockData = [coinbaseTx, tx];
  return generateRawNextBlock(blockData);
};
exports.generatenextBlockWithTransaction = generatenextBlockWithTransaction;
const findBlock = (index, previousHash, timestamp, data, difficulty) => {
  let nonce = 0;
  while (true) {
    const hash = calculateHash(
      index,
      previousHash,
      timestamp,
      data,
      difficulty,
      nonce
    );
    if (hashMatchesDifficulty(hash, difficulty)) {
      return new Block(
        index,
        hash,
        previousHash,
        timestamp,
        data,
        difficulty,
        nonce
      );
    }
    nonce++;
  }
};

const getAccountBalance = () => {
  return wallet.getBalance(wallet.getPublicFromWallet(), getUnspentTxOuts());
};

exports.getAccountBalance = getAccountBalance;

const getAccountBalanceByPrivateKey = (privateKey) => {
  console.log(privateKey, wallet.getPublicFromPrivateKey(privateKey));
  return wallet.getBalance(
    wallet.getPublicFromPrivateKey(privateKey),
    getUnspentTxOuts()
  );
};
exports.getAccountBalanceByPrivateKey = getAccountBalanceByPrivateKey;

const sendTransaction = (address, amount, privateKey) => {
  const tx = wallet.createTransaction(
    address,
    amount,
    privateKey,
    getUnspentTxOuts(),
    transactionPool.getTransactionPool()
  );
  transactionPool.addToTransactionPool(tx, getUnspentTxOuts());
  p2p.broadCastTransactionPool();
  return tx;
};
exports.sendTransaction = sendTransaction;
const calculateHashForBlock = (block) =>
  calculateHash(
    block.index,
    block.previousHash,
    block.timestamp,
    block.data,
    block.difficulty,
    block.nonce
  );
const calculateHash = (
  index,
  previousHash,
  timestamp,
  data,
  difficulty,
  nonce
) =>
  CryptoJS.SHA256(
    index + previousHash + timestamp + data + difficulty + nonce
  ).toString();
const isValidBlockStructure = (block) => {
  return (
    typeof block.index === "number" &&
    typeof block.hash === "string" &&
    typeof block.previousHash === "string" &&
    typeof block.timestamp === "number" &&
    typeof block.data === "object"
  );
};
exports.isValidBlockStructure = isValidBlockStructure;
const isValidNewBlock = (newBlock, previousBlock) => {
  if (!isValidBlockStructure(newBlock)) {
    console.log("invalid block structure: %s", JSON.stringify(newBlock));
    return false;
  }
  if (previousBlock.index + 1 !== newBlock.index) {
    console.log("invalid index");
    return false;
  } else if (previousBlock.hash !== newBlock.previousHash) {
    console.log("invalid previoushash");
    return false;
  } else if (!isValidTimestamp(newBlock, previousBlock)) {
    console.log("invalid timestamp");
    return false;
  } else if (!hasValidHash(newBlock)) {
    return false;
  }
  return true;
};
const getAccumulatedDifficulty = (aBlockchain) => {
  return aBlockchain
    .map((block) => block.difficulty)
    .map((difficulty) => Math.pow(2, difficulty))
    .reduce((a, b) => a + b);
};
const isValidTimestamp = (newBlock, previousBlock) => {
  return (
    previousBlock.timestamp - 60 < newBlock.timestamp &&
    newBlock.timestamp - 60 < getCurrentTimestamp()
  );
};
const hasValidHash = (block) => {
  if (!hashMatchesBlockContent(block)) {
    console.log("invalid hash, got:" + block.hash);
    return false;
  }
  if (!hashMatchesDifficulty(block.hash, block.difficulty)) {
    console.log(
      "block difficulty not satisfied. Expected: " +
        block.difficulty +
        "got: " +
        block.hash
    );
  }
  return true;
};
const hashMatchesBlockContent = (block) => {
  const blockHash = calculateHashForBlock(block);
  return blockHash === block.hash;
};
const hashMatchesDifficulty = (hash, difficulty) => {
  // Ensure difficulty is not negative
  if (difficulty < 0) {
    difficulty = 0;
  }
  const hashInBinary = util.hexToBinary(hash);
  const requiredPrefix = "0".repeat(difficulty);
  return hashInBinary.startsWith(requiredPrefix);
};
/*
    Checks if the given blockchain is valid. Return the unspent txOuts if the chain is valid
 */
const isValidChain = (blockchainToValidate) => {
  console.log("isValidChain:");
  console.log(JSON.stringify(blockchainToValidate));
  const isValidGenesis = (block) => {
    return JSON.stringify(block) === JSON.stringify(genesisBlock);
  };
  if (!isValidGenesis(blockchainToValidate[0])) {
    return null;
  }
  /*
    Validate each block in the chain. The block is valid if the block structure is valid
      and the transaction are valid
     */
  let aUnspentTxOuts = [];
  for (let i = 0; i < blockchainToValidate.length; i++) {
    const currentBlock = blockchainToValidate[i];
    if (
      i !== 0 &&
      !isValidNewBlock(blockchainToValidate[i], blockchainToValidate[i - 1])
    ) {
      return null;
    }
    aUnspentTxOuts = transaction.processTransactions(
      currentBlock.data,
      aUnspentTxOuts,
      currentBlock.index
    );
    if (aUnspentTxOuts === null) {
      console.log("invalid transactions in blockchain");
      return null;
    }
  }
  return aUnspentTxOuts;
};
const addBlockToChain = (newBlock) => {
  if (isValidNewBlock(newBlock, getLatestBlock())) {
    const retVal = transaction.processTransactions(
      newBlock.data,
      getUnspentTxOuts(),
      newBlock.index
    );
    if (retVal === null) {
      console.log("block is not valid in terms of transactions");
      return false;
    } else {
      blockchain.push(newBlock);
      setUnspentTxOuts(retVal);
      transactionPool.updateTransactionPool(unspentTxOuts);
      return true;
    }
  }
  return false;
};
exports.addBlockToChain = addBlockToChain;
const replaceChain = (newBlocks) => {
  const aUnspentTxOuts = isValidChain(newBlocks);
  const validChain = aUnspentTxOuts !== null;
  if (
    validChain &&
    getAccumulatedDifficulty(newBlocks) >
      getAccumulatedDifficulty(getBlockchain())
  ) {
    console.log(
      "Received blockchain is valid. Replacing current blockchain with received blockchain"
    );
    blockchain = newBlocks;
    setUnspentTxOuts(aUnspentTxOuts);
    transactionPool.updateTransactionPool(unspentTxOuts);
    p2p.broadcastLatest();
  } else {
    console.log("Received blockchain invalid");
  }
};
exports.replaceChain = replaceChain;
const handleReceivedTransaction = (transaction) => {
  transactionPool.addToTransactionPool(transaction, getUnspentTxOuts());
};
exports.handleReceivedTransaction = handleReceivedTransaction;
//# sourceMappingURL=blockchain.js.map
