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
    quantity: mongodb.Decimal128,
    amount: mongodb.Decimal128,
    ltp: mongodb.Decimal128,
    transactionDate: Date,
  },
  {
    collection: "stocks",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

module.exports = mongoose.model("Stock", StockSchema);
