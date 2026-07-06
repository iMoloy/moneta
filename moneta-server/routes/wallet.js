import express from "express";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import Coupon from "../models/Coupon.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Verify transaction PIN — the client always pre-hashes the PIN with SHA-256
// before sending, so we compare the received hash directly to the stored hash.
const verifyPin = (inputPin, storedPinHash) => {
  return inputPin === storedPinHash;
};

// All wallet routes require authorization
router.use(requireAuth);

/**
 * @route   POST /api/wallet/add-money
 * @desc    Deposit simulated money into user's wallet
 */
router.post("/add-money", async (req, res) => {
  const { amount, pin, source } = req.body;

  try {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      return res.status(400).json({ error: "Invalid amount. Must be greater than 0." });
    }

    if (!pin) {
      return res.status(400).json({ error: "Security PIN is required." });
    }

    // Fetch user from DB to get the latest credentials
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (!verifyPin(pin, user.pin)) {
      return res.status(401).json({ error: "Incorrect security PIN." });
    }

    // Increment balance
    user.balance += val;
    await user.save();

    // Log transaction
    const tx = new Transaction({
      userId: user._id,
      title: `Deposit from ${source || "Bank/Card"}`,
      amount: val,
      type: "credit",
      category: "add",
      counterParty: source || "External Source",
    });
    await tx.save();

    res.json({
      message: "Money added successfully.",
      balance: user.balance,
      transaction: tx,
    });
  } catch (error) {
    console.error("Add money error:", error.message);
    res.status(500).json({ error: "Failed to process transaction." });
  }
});

/**
 * @route   POST /api/wallet/cashout
 * @desc    Withdraw money through an agent with 1.85% fee
 */
router.post("/cashout", async (req, res) => {
  const { amount, pin, agentPhone } = req.body;

  try {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      return res.status(400).json({ error: "Invalid amount. Must be greater than 0." });
    }

    if (!agentPhone) {
      return res.status(400).json({ error: "Agent mobile number is required." });
    }

    const fee = val * 0.0185;
    const totalDeduction = val + fee;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (!verifyPin(pin, user.pin)) {
      return res.status(401).json({ error: "Incorrect security PIN." });
    }

    if (user.balance < totalDeduction) {
      return res.status(400).json({ error: "Insufficient balance to cover withdrawal and fee." });
    }

    // Deduct balance
    user.balance -= totalDeduction;
    await user.save();

    // Log transaction
    const tx = new Transaction({
      userId: user._id,
      title: "Cash Out Withdrawal",
      amount: val, // Log base amount withdrawn
      type: "debit",
      category: "cashout",
      counterParty: agentPhone,
    });
    await tx.save();

    res.json({
      message: "Cash out withdrawal successful.",
      balance: user.balance,
      fee,
      transaction: tx,
    });
  } catch (error) {
    console.error("Cash out error:", error.message);
    res.status(500).json({ error: "Failed to process withdrawal." });
  }
});

/**
 * @route   POST /api/wallet/transfer
 * @desc    Transfer money atomically to another Moneta user
 */
router.post("/transfer", async (req, res) => {
  const { amount, pin, receiverPhone } = req.body;

  try {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      return res.status(400).json({ error: "Invalid amount. Must be greater than 0." });
    }

    if (!receiverPhone) {
      return res.status(400).json({ error: "Recipient phone number is required." });
    }

    if (receiverPhone === req.user.phone) {
      return res.status(400).json({ error: "Cannot transfer money to yourself." });
    }

    const sender = await User.findById(req.user.id);
    if (!sender) {
      return res.status(404).json({ error: "Sender not found." });
    }

    if (!verifyPin(pin, sender.pin)) {
      return res.status(401).json({ error: "Incorrect security PIN." });
    }

    if (sender.balance < val) {
      return res.status(400).json({ error: "Insufficient balance." });
    }

    // Find receiver
    const receiver = await User.findOne({ phone: receiverPhone });
    if (!receiver) {
      return res.status(404).json({ error: "Recipient number not registered on Moneta." });
    }

    // Atomic updates
    sender.balance -= val;
    receiver.balance += val;
    await sender.save();
    await receiver.save();

    // Log sender's transaction
    const senderTx = new Transaction({
      userId: sender._id,
      title: `Transfer to ${receiver.name}`,
      amount: val,
      type: "debit",
      category: "transfer",
      counterParty: receiver.phone,
    });
    await senderTx.save();

    // Log receiver's transaction
    const receiverTx = new Transaction({
      userId: receiver._id,
      title: `Received from ${sender.name}`,
      amount: val,
      type: "credit",
      category: "transfer",
      counterParty: sender.phone,
    });
    await receiverTx.save();

    res.json({
      message: "Transfer successful.",
      balance: sender.balance,
      transaction: senderTx,
    });
  } catch (error) {
    console.error("Transfer error:", error.message);
    res.status(500).json({ error: "Failed to process transfer." });
  }
});

/**
 * @route   POST /api/wallet/pay-bill
 * @desc    Pay utility billers
 */
router.post("/pay-bill", async (req, res) => {
  const { amount, pin, billerName, subscriberId } = req.body;

  try {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      return res.status(400).json({ error: "Invalid amount. Must be greater than 0." });
    }

    if (!billerName || !subscriberId) {
      return res.status(400).json({ error: "Biller name and subscriber ID are required." });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (!verifyPin(pin, user.pin)) {
      return res.status(401).json({ error: "Incorrect security PIN." });
    }

    if (user.balance < val) {
      return res.status(400).json({ error: "Insufficient balance." });
    }

    // Deduct balance
    user.balance -= val;
    await user.save();

    // Log transaction
    const tx = new Transaction({
      userId: user._id,
      title: `Utility Bill (${billerName})`,
      amount: val,
      type: "debit",
      category: "bill",
      counterParty: `${billerName} - Sub ID: ${subscriberId}`,
    });
    await tx.save();

    res.json({
      message: "Bill payment successful.",
      balance: user.balance,
      transaction: tx,
    });
  } catch (error) {
    console.error("Pay bill error:", error.message);
    res.status(500).json({ error: "Failed to pay bill." });
  }
});

/**
 * @route   POST /api/wallet/claim-coupon
 * @desc    Redeem promo coupon rewards
 */
router.post("/claim-coupon", async (req, res) => {
  const { code } = req.body;

  try {
    if (!code) {
      return res.status(400).json({ error: "Promo coupon code is required." });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) {
      return res.status(404).json({ error: "Invalid or expired promo code." });
    }

    // Check if user has already claimed this coupon
    const hasClaimed = coupon.claimedBy.includes(req.user.id);
    if (hasClaimed) {
      return res.status(400).json({ error: "You have already claimed this promo code." });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Apply reward
    user.balance += coupon.bonusAmount;
    await user.save();

    // Log coupon claim
    coupon.claimedBy.push(user._id);
    await coupon.save();

    // Log transaction
    const tx = new Transaction({
      userId: user._id,
      title: `Promo Reward (${coupon.code})`,
      amount: coupon.bonusAmount,
      type: "credit",
      category: "bonus",
      counterParty: "System Promo",
    });
    await tx.save();

    res.json({
      message: `Successfully redeemed coupon! Bonus of $${coupon.bonusAmount} added to balance.`,
      balance: user.balance,
      transaction: tx,
    });
  } catch (error) {
    console.error("Claim coupon error:", error.message);
    res.status(500).json({ error: "Failed to redeem coupon." });
  }
});

/**
 * @route   GET /api/wallet/transactions
 * @desc    Get user transaction ledger
 */
router.get("/transactions", async (req, res) => {
  const { category, limit = 20, search } = req.query;

  try {
    const filter = { userId: req.user.id };

    if (category) {
      filter.category = category;
    }

    if (search) {
      // Allow searching by transaction title or counterparty name
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { counterParty: { $regex: search, $options: "i" } },
      ];
    }

    const txs = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ transactions: txs });
  } catch (error) {
    console.error("Fetch transactions error:", error.message);
    res.status(500).json({ error: "Failed to retrieve transaction history." });
  }
});

/**
 * @route   POST /api/wallet/profile-image
 * @desc    Update user profile image URL
 */
router.post("/profile-image", async (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: "Image URL is required." });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { avatar: imageUrl, image: imageUrl } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({ success: true, avatar: imageUrl, image: imageUrl });
  } catch (error) {
    console.error("Update profile image error:", error.message);
    res.status(500).json({ error: "Failed to update profile image." });
  }
});

export default router;
