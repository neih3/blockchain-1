const bodyParser = require("body-parser");
const express = require("express");
const _ = require("lodash");
const cors = require("cors");
const mongoose = require("mongoose");
const blockchain = require("./blockchain/blockchain");
const p2p = require("./blockchain/p2p");
const logger = require("morgan");
const transactionPool = require("./blockchain/transactionPool");
const wallet = require("./blockchain/wallet");
const httpPort = parseInt(process.env.HTTP_PORT) || 3001;
const p2pPort = parseInt(process.env.P2P_PORT) || 6001;
const passport = require("passport");

require("./middlewares/passport");
require("express-async-errors");

const initHttpServer = (myHttpPort) => {
  const app = express();

  // CORS Configuration
  const allowedOrigins = [
    "http://localhost:3000", // For local dev (React default port)
    "http://localhost:3001", // For local dev (if your client runs on this port)
    "https://blockchain-1-bufk.vercel.app", // Your new deployed frontend URL
  ];

  app.use(
    cors({
      origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
          const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
          return callback(new Error(msg), false);
        }
        return callback(null, true);
      },
      credentials: true, // Important if you need to send cookies or Authorization headers
    })
  );
  app.use(bodyParser.json());
  app.use(logger("dev"));
  // Connect to database
  mongoose
    .connect(
      "mongodb+srv://hiencastoo:u6GcSUlTnAwVGObY@cluster0.t1cjzxd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        authSource: "admin",
      }
    )
    .then(() => {
      console.log("Successfully connected to the database");
    })
    .catch((err) => {
      console.log("Could not connected to the database. Exiting now...", err);
      process.exit();
    });
  app.use((err, req, res, next) => {
    if (err) {
      res.status(400).send(err.message);
    }
  });

  app.use("/api/auth", require("./routes/auth.route"));
  app.get("/blocks", (req, res) => {
    res.send(blockchain.getBlockchain());
  });
  app.get("/block/:hash", (req, res) => {
    const block = _.find(blockchain.getBlockchain(), {
      hash: req.params.hash,
    });
    res.send(block);
  });
  app.get("/transaction/:id", (req, res) => {
    const tx = _(blockchain.getBlockchain())
      .map((blocks) => blocks.data)
      .flatten()
      .find({ id: req.params.id });
    res.send(tx);
  });
  app.get("/address/:address", (req, res) => {
    const unspentTxOuts = _.filter(
      blockchain.getUnspentTxOuts(),
      (uTxO) => uTxO.address === req.params.address
    );
    res.send({ unspentTxOuts: unspentTxOuts });
  });
  app.get("/unspentTransactionOutputs", (req, res) => {
    res.send(blockchain.getUnspentTxOuts());
  });
  app.get(
    "/myUnspentTransactionOutputs",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      res.send(blockchain.getMyUnspentTransactionOutputs(req.user.privateKey));
    }
  );
  app.post("/mineRawBlock", (req, res) => {
    if (req.body.data == null) {
      res.send("data parameter is missing");
      return;
    }
    const newBlock = blockchain.generateRawNextBlock(req.body.data);
    if (newBlock === null) {
      res.status(400).send("could not generate block");
    } else {
      res.send(newBlock);
    }
  });
  app.post(
    "/mineBlock",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      const newBlock = blockchain.generateNextBlock(req.user.privateKey);
      if (newBlock === null) {
        res.status(400).send("could not generate block");
      } else {
        res.send(newBlock);
      }
    }
  );
  app.post(
    "/mineFromPool",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      const txPool = transactionPool.getTransactionPool();
      if (!txPool || txPool.length === 0) {
        return res
          .status(400)
          .send("Transaction pool is empty. Nothing to mine.");
      }
      const publicKey = wallet.getPublicFromPrivateKey(req.user.privateKey);
      // Lọc các transaction không liên quan đến user hiện tại
      const otherTxs = txPool.filter(
        (tx) =>
          !(tx.txIns && tx.txIns.some((txIn) => txIn.address === publicKey)) &&
          !(tx.txOuts && tx.txOuts.some((txOut) => txOut.address === publicKey))
      );
      if (otherTxs.length === 0) {
        return res
          .status(400)
          .send("No transactions from other users to mine.");
      }
      // Tạo coinbase transaction cho miner
      const transaction = require("./blockchain/transaction");
      const blockchainModule = require("./blockchain/blockchain");
      const coinbaseTx = transaction.getCoinbaseTransaction(
        publicKey,
        blockchainModule.getLatestBlock().index + 1
      );
      const blockData = [coinbaseTx, ...otherTxs];
      const newBlock = blockchainModule.generateRawNextBlock(blockData);
      if (newBlock === null) {
        res.status(400).send("Could not generate block from pool");
      } else {
        res.send({
          block: newBlock,
          confirmedTransactions: otherTxs,
          message: `Mined block #${newBlock.index} with ${otherTxs.length} transaction(s) confirmed.`,
        });
      }
    }
  );
  app.get(
    "/balance",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      console.log(req.user.privateKey);
      const balance = blockchain.getAccountBalanceByPrivateKey(
        req.user.privateKey
      );
      res.send({ balance: balance });
    }
  );
  app.get("/address", (req, res) => {
    const address = wallet.getPublicFromWallet();
    res.send({ address: address });
  });
  app.post(
    "/mineTransaction",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      const address = req.body.address;
      const amount = req.body.amount;
      try {
        const resp = blockchain.generatenextBlockWithTransaction(
          address,
          amount,
          req.user.privateKey
        );
        res.send(resp);
      } catch (e) {
        console.log(e.message);
        res.status(400).send(e.message);
      }
    }
  );
  app.post(
    "/sendTransaction",
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
      try {
        const address = req.body.address;
        const amount = req.body.amount;
        if (address === undefined || amount === undefined) {
          throw Error("invalid address or amount");
        }
        const resp = blockchain.sendTransaction(
          address,
          amount,
          req.user.privateKey
        );
        res.send(resp);
      } catch (e) {
        console.log(e.message);
        res.status(400).send(e.message);
      }
    }
  );
  app.get("/transactionPool", (req, res) => {
    res.send(transactionPool.getTransactionPool());
  });
  app.get("/peers", (req, res) => {
    res.send(
      p2p
        .getSockets()
        .map((s) => s._socket.remoteAddress + ":" + s._socket.remotePort)
    );
  });
  app.post("/addPeer", (req, res) => {
    p2p.connectToPeers(req.body.peer);
    res.send();
  });
  app.post("/stop", (req, res) => {
    res.send({ msg: "stopping server" });
    process.exit();
  });
  app.listen(myHttpPort, () => {
    console.log("Listening http on port: " + myHttpPort);
  });
};
initHttpServer(httpPort);
p2p.initP2PServer(p2pPort);
wallet.initWallet();
