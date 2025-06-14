const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const usersModel = require("../models/users.model");
const { randomString } = require("../helpers/helpers");
const bcrypt = require("bcryptjs");
const { totp } = require("otplib");
const nodemailer = require("nodemailer");
const moment = require("moment");
const wallet = require("../blockchain/wallet");
const responseHelper = require("../helpers/response");
const p2p = require("../blockchain/p2p");
const config = require("../config/default.json");

const router = express.Router();

// --- Đăng ký ---
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return responseHelper.badRequestResponse(
      res,
      false,
      "Missing credentials! Username, email và password là bắt buộc!",
      null
    );
  }
  const existedEmail = await usersModel.findOne({ email });
  if (existedEmail) {
    return responseHelper.badRequestResponse(
      res,
      false,
      "Email đã tồn tại!",
      null
    );
  }
  const existedUser = await usersModel.findOne({ username });
  if (existedUser) {
    return responseHelper.badRequestResponse(
      res,
      false,
      "Username đã tồn tại!",
      null
    );
  }
  const privateKey = wallet.generatePrivateKey();
  const publicKey = wallet.getPublicFromPrivateKey(privateKey);
  const user = new usersModel({ username, email, privateKey, publicKey });
  user.setPasswordHash(password);
  await user.save();
  return responseHelper.okResponse(res, true, "Đăng ký thành công!", null);
});

// --- Đăng nhập ---
router.post("/signin", (req, res) => {
  passport.authenticate("local", { session: false }, (error, user, info) => {
    if (error || !user) return res.status(401).send(info);
    req.login(user, { session: false }, async (error) => {
      if (error) throw new Error();
      const { _id, username, email, role } = user;
      const tempRefreshToken = randomString(40);
      await usersModel.findByIdAndUpdate(_id, {
        refreshToken: tempRefreshToken,
        rdt: moment().format(),
      });
      const accessToken = generateAccessToken(username, role);
      return res.json({ accessToken, refreshToken: tempRefreshToken });
    });
  })(req, res);
});

// --- Lấy thông tin user (mở rộng: trả thêm số dư và lịch sử giao dịch) ---
router.get(
  "/me",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { username, role, createdAt } = req.user;
    const publicKey = wallet.getPublicFromPrivateKey(req.user.privateKey);
    const balance = wallet.getBalance(
      publicKey,
      require("../blockchain/blockchain").getUnspentTxOuts()
    );
    const blockchain = require("../blockchain/blockchain").getBlockchain();
    const history = [];
    blockchain.forEach((block) => {
      block.data.forEach((tx) => {
        let type = null;
        let amount = 0;
        let sender = null;
        let receiver = null;
        // Xác định loại giao dịch và các trường liên quan
        if (tx.txOuts && tx.txOuts.some((output) => output.address === publicKey)) {
          // Nhận coin
          type = "received";
          receiver = publicKey;
          // Tìm sender nếu có (coinbase thì sender=null)
          if (tx.txIns && tx.txIns.length > 0 && tx.txIns[0].address) {
            sender = tx.txIns[0].address;
          }
          // Tổng số tiền nhận được trong tx này
          amount = tx.txOuts.filter((output) => output.address === publicKey).reduce((sum, o) => sum + o.amount, 0);
        }
        if (tx.txIns && tx.txIns.some((input) => input.address === publicKey)) {
          // Gửi coin
          type = "sent";
          sender = publicKey;
          // Tìm receiver (có thể nhiều)
          receiver = tx.txOuts.map((o) => o.address).filter((addr) => addr !== publicKey);
          // Tổng số tiền gửi đi
          amount = tx.txOuts.filter((output) => output.address !== publicKey).reduce((sum, o) => sum + o.amount, 0);
        }
        if (type) {
          history.push({
            blockIndex: block.index,
            timestamp: block.timestamp,
            txId: tx.id,
            type,
            sender,
            receiver,
            amount,
            status: "confirmed",
          });
        }
      });
    });
    // Sắp xếp lịch sử mới nhất lên đầu
    history.sort((a, b) => b.timestamp - a.timestamp);
    // Lấy 3 giao dịch nhận coin mới nhất (cho thông báo)
    const latestReceived = history.filter(h => h.type === "received").slice(0, 3);
    return responseHelper.okResponse(res, true, "", {
      username,
      role,
      createdAt,
      publicKey,
      balance,
      history,
      latestReceived,
    });
  }
);

// --- Xác thực token ---
router.get(
  "/verify-token",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    if (req.user) {
      res.status(200).json({
        message: "Access token is valid!",
        role: req.user.role,
      });
    } else {
      res.status(404).send({
        message: "Không tìm thấy thông tin người dùng",
      });
    }
  }
);

// --- Refresh token ---
router.post("/refresh", async (req, res) => {
  if (!req.body.refreshToken || !req.body.accessToken) {
    return res.status(400).json("Invalid access-token or refresh-token");
  }
  await jwt.verify(
    req.body.accessToken,
    "secretKey",
    { ignoreExpiration: true },
    async function (err, payload) {
      if (err) return res.status(400).json(err);
      const { username, role } = payload;
      const ret = await usersModel.findOne({
        username,
        refreshToken: req.body.refreshToken,
      });
      if (ret) {
        const accessToken = generateAccessToken(username, role);
        res.status(200).json({ accessToken });
      } else {
        res.status(400).json({ message: "Refresh không thành công" });
      }
    }
  );
});

// --- Quên mật khẩu ---
router.post("/forgot-password", async (req, res) => {
  const email = req.body.email;
  usersModel.findOne({ email }).exec((err, user) => {
    if (err) return res.status(500).send({ message: err });
    if (!user) return res.status(404).send({ message: "User Not found." });
    totp.options = { step: 300 };
    const code = totp.generate(email);
    var transporter = nodemailer.createTransport(config.emailTransportOptions);
    var content = `<div><h2>Hi, ${
      user.name?.toUpperCase() || user.username
    }!</h2><p>You recently requested to reset your password. Here is your OTP code to reset:</p><h1>${code}</h1><p>If you did not request a password reset, please ignore this email! This password reset is only valid for the next 5 minutes.</p><p>Thanks,</p></div>`;
    var mailOptions = {
      from: config.emailTransportOptions.auth.user,
      to: email,
      subject: "Password Reset",
      html: content,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
        return res.status(400).json({ success: false });
      } else {
        console.log("Email sent: " + info.response);
        return res.json({ success: true });
      }
    });
  });
});

router.post("/verify-forgot-password", (req, res) => {
  const { code, newPassword, email } = req.body;
  usersModel.findOne({ email }).exec(async (err, user) => {
    if (err) return res.status(500).send({ message: err });
    if (!user) return res.status(404).send({ message: "User Not found." });
    const isValid = totp.check(code, email);
    if (isValid) {
      const newPasswordHash = bcrypt.hashSync(newPassword, 10);
      const result = await usersModel.findOneAndUpdate(
        { email },
        { passwordHash: newPasswordHash }
      );
      if (result) {
        return res.json({ success: true, message: "Reset password success" });
      } else {
        return res.status(400).json({ message: "Authentication error!" });
      }
    } else {
      return res.status(400).json({ message: "Code is invalid or expired!" });
    }
  });
});

// --- Đổi mật khẩu khi đã đăng nhập ---
router.post(
  "/change-password",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: "Thiếu mật khẩu cũ hoặc mới!" });
      }
      const user = await usersModel.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: "Không tìm thấy người dùng!" });
      }
      // Kiểm tra mật khẩu cũ
      const isMatch = bcrypt.compareSync(oldPassword, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ message: "Mật khẩu cũ không đúng!" });
      }
      // Đặt mật khẩu mới
      user.setPasswordHash(newPassword);
      await user.save();
      return res.json({ success: true, message: "Đổi mật khẩu thành công!" });
    } catch (err) {
      return res.status(500).json({ message: "Có lỗi xảy ra!", error: err.message });
    }
  }
);

// --- P2P: Thêm peer mới ---
router.post("/addPeer", (req, res) => {
  const peer = req.body.peer;
  if (!peer) {
    return res
      .status(400)
      .json({ success: false, message: "Missing peer address!" });
  }
  p2p.connectToPeers([peer]);
  res.json({ success: true, message: `Peer ${peer} added.` });
});

function generateAccessToken(username, role) {
  return jwt.sign({ username, role }, "secretKey", { expiresIn: "10m" });
}

module.exports = router;
