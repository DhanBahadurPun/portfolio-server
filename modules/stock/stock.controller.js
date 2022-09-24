const StockModel = require("./stock.model");

const stockMapped = (stock, payload) => {
  stock.name = payload.name;
  stock.transactionType = payload.transactionType;
  return stock;
};

class Stock {
  constructor() {}

  buySellStock(payload) {
    return new Promise((resolve, reject) => {
      let newStock = new StockModel();

      if (payload.transactionType === "buy") {
        newStock.buyAmount = payload.amount;
        newStock.buyQuantity = payload.quantity;
        stockMapped(newStock, payload)
          .save()
          .then((stock) => {
            resolve(stock);
          })
          .catch((err) => reject(err));
      } else {
        newStock.sellAmount = payload.amount;
        newStock.sellQuantity = payload.quantity;
        stockMapped(newStock, payload)
          .save()
          .then((stock) => {
            resolve(stock);
          })
          .catch((err) => reject(err));
      }
    });
  }

  getBuySellStock() {
    return new Promise((resolve, reject) => {
      StockModel.find({})
        .then((stocks) => resolve(stocks))
        .catch((err) => reject(err));
    });
  }

  /*
  // Stocks Updated When users buy same stock multiple times
  getStocks() {
    return new Promise((resolve, reject) => {
      StockModel.aggregate([
        {
          $match: {},
        },

        {
          $group: {
            _id: {
              name: "$name",
              transactionType: "$transactionType",
            },
            totalQuantity: { $sum: "$quantity" },
            totalCost: { $sum: { $multiply: ["$quantity", "$ltp"] } },
            Dates: { $push: "$transactionDate" },
            ltp: { $push: "$ltp" },
            totalBuy: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            name: "$_id.name",
            transactionType: "$_id.transactionType",
            totalQuantity: 1,
            WCC: { $divide: ["$totalCost", "$totalQuantity"] },
            Date: { $arrayElemAt: ["$Dates", -1] },
            ltpPrice: { $arrayElemAt: ["$ltp", -1] },
          },
        },
        {
          $project: {
            name: 1,
            transactionType: 1,
            totalQuantity: 1,
            WCC: 1,
            Date: 1,
            currentAmount: {
              $multiply: ["$totalQuantity", "$ltpPrice"],
            },
          },
        },
      ])
        .then((stocks) => resolve(stocks))
        .catch((err) => reject(err));
    });
  }
*/
  getIndividualDetails() {
    return new Promise((resolve, reject) => {
      StockModel.aggregate([
        {
          $group: {
            _id: {
              name: "$name",
            },
            totalBuyQuantity: { $sum: "$buyQuantity" },
            totalSellQuantity: { $sum: "$sellQuantity" },
            totalSellCost: {
              $sum: { $multiply: ["$sellQuantity", "$sellAmount"] },
            },
            totalBuyCost: {
              $sum: { $multiply: ["$buyQuantity", "$buyAmount"] },
            },
            total: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            name: "$_id.name",
            totalSellCost: 1,
            overalProfit: { $subtract: ["$totalBuyCost", "$totalSellCost"] },
            averageBuyCost: { $divide: ["$totalBuyCost", "$totalBuyQuantity"] },
            totalUnit: {
              $subtract: ["$totalBuyQuantity", "$totalSellQuantity"],
            },
          },
        },
        {
          $project: {
            name: 1,
            totalSellCost: 1,
            totalUnit: 1,
            overalProfit: 1,
            totalInvestment: { $multiply: ["$totalUnit", "$averageBuyCost"] },
          },
        },
        {
          $project: {
            name: 1,
            totalSellCost: 1,
            totalUnit: 1,
            overalProfit: 1,
            totalInvestment: 1,
            currentAmount: {
              $cond: {
                if: { $eq: ["$totalInvestment", 0] },
                then: 0,
                else: { $subtract: ["$totalInvestment", "$totalSellCost"] },
              },
            },
          },
        },
      ])
        .then((stocks) => resolve(stocks))
        .catch((err) => reject(err));
    });
  }

  getAllDetails() {
    return new Promise((resolve, reject) => {
      StockModel.aggregate([
        {
          $group: {
            _id: {
              buyStatus: "buy",
              sellStatus: "sell",
            },
            totalBuyQuantity: { $sum: "$buyQuantity" },
            totalSellQuantity: { $sum: "$sellQuantity" },
            totalSellCost: {
              $sum: { $multiply: ["$sellQuantity", "$sellAmount"] },
            },
            totalBuyCost: {
              $sum: { $multiply: ["$buyQuantity", "$buyAmount"] },
            },
            total: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            totalSellCost: 1,
            overalProfit: { $subtract: ["$totalBuyCost", "$totalSellCost"] },
            averageBuyCost: { $divide: ["$totalBuyCost", "$totalBuyQuantity"] },
            totalUnit: {
              $subtract: ["$totalBuyQuantity", "$totalSellQuantity"],
            },
          },
        },
        {
          $project: {
            totalSellCost: 1,
            totalUnit: 1,
            overalProfit: 1,
            totalInvestment: { $multiply: ["$totalUnit", "$averageBuyCost"] },
          },
        },
        {
          $project: {
            totalSellCost: 1,
            totalUnit: 1,
            overalProfit: 1,
            totalInvestment: 1,
            currentAmount: {
              $cond: {
                if: { $eq: ["$totalInvestment", 0] },
                then: 0,
                else: { $subtract: ["$totalInvestment", "$totalSellCost"] },
              },
            },
          },
        },
      ])
        .then((stocks) => resolve(stocks))
        .catch((err) => reject(err));
    });
  }

  getSellStocks() {
    return new Promise((resolve, reject) => {
      StockModel.aggregate([
        {
          $match: {
            transactionType: "sell",
          },
        },

        {
          $group: {
            _id: {
              name: "$name",
            },
            totalSellQuantity: { $sum: "$quantity" },
            totalSold: { $sum: { $multiply: ["$quantity", "$ltp"] } },
            Dates: { $push: "$transactionDate" },
            ltp: { $push: "$ltp" },
            totalSell: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            name: "$_id.name",
            totalSellQuantity: 1,
            totalSold: 1,
            Date: { $arrayElemAt: ["$Dates", -1] },
            ltpPrice: { $arrayElemAt: ["$ltp", -1] },
          },
        },
        { $sort: { Date: -1 } },
      ])
        .then((stocks) => resolve(stocks))
        .catch((err) => reject(err));
    });
  }

  totalBuy() {
    return new Promise((resolve, reject) => {
      StockModel.aggregate([
        {
          $match: {
            transactionType: "buy",
          },
        },
        {
          $group: {
            _id: { transactionType: "$transactionType" },
            buyQuantity: { $sum: "$quantity" },
            buyAmount: { $sum: { $multiply: ["$quantity", "$ltp"] } },
            ltp: { $push: "$ltp" },
            total: { $sum: 1 },
          },
        },
        {
          $project: {
            buyQuantity: 1,
            buyAmount: 1,
            WCC: { $divide: ["$buyAmount", "$buyQuantity"] },
            ltp: { $arrayElemAt: ["$ltp", -1] },
          },
        },
      ])
        .then((stock) => resolve(stock))
        .catch((err) => reject(err));
    });
  }

  totalSell() {
    return new Promise((resolve, reject) => {
      StockModel.aggregate([
        {
          $match: {
            transactionType: "sell",
          },
        },
        {
          $group: {
            _id: { transactionType: "$transactionType" },
            soldQuantity: { $sum: "$quantity" },
            soldAmount: { $sum: { $multiply: ["$quantity", "$ltp"] } },
            total: { $sum: 1 },
          },
        },
      ])
        .then((stock) => resolve(stock))
        .catch((err) => reject(err));
    });
  }
}

module.exports = new Stock();
