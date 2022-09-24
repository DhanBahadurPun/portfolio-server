const mongoose = require("mongoose");
const mongodb = require("mongodb");

const StockSchema = mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    transactionType: {
      type: String,
      require: true,
      enum: ["buy", "sell"],
    },
    buyQuantity: Number,
    sellQuantity: Number,
    buyAmount: Number,
    sellAmount: Number,
  },
  {
    collection: "stocks",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

module.exports = mongoose.model("Stock", StockSchema);
