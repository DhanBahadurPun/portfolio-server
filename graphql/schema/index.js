const StockModel = require("../../modules/stock/stock.model");
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLEnumType,
  GraphQLSchema,
  GraphQLList,
  GraphQLFloat,
} = require("graphql");

const StatusType = new GraphQLEnumType({
  name: "Status",
  values: {
    Buy: { value: "buy" },
    Sell: { value: "sell" },
  },
});

const StockType = new GraphQLObjectType({
  name: "Stock",
  fields: () => ({
    name: { type: GraphQLString },
    transactionType: { type: StatusType },
    buyQuantity: { type: GraphQLInt },
    sellQuantity: { type: GraphQLInt },
    buyAmount: { type: GraphQLInt },
    sellAmount: { type: GraphQLInt },
  }),
});

const StockDetailsType = new GraphQLObjectType({
  name: "StockDetails",
  fields: () => ({
    totalSellCost: { type: GraphQLInt },
    name: { type: GraphQLString },
    overalProfit: { type: GraphQLFloat },
    totalUnit: { type: GraphQLInt },
    totalInvestment: { type: GraphQLFloat },
    currentAmount: { type: GraphQLFloat },
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: "RootQuery",
  fields: () => ({
    getStocks: {
      type: new GraphQLList(StockType),
      async resolve() {
        const stock = await StockModel.find({});
        return stock;
      },
    },
    getIndividualDetails: {
      type: new GraphQLList(StockDetailsType),
      async resolve() {
        const stockList = await StockModel.aggregate([
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
              averageBuyCost: {
                $divide: ["$totalBuyCost", "$totalBuyQuantity"],
              },
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
        ]);
        return stockList;
      },
    },
    getAllDetails: {
      type: new GraphQLList(StockDetailsType),
      async resolve() {
        const details = await StockModel.aggregate([
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
              averageBuyCost: {
                $divide: ["$totalBuyCost", "$totalBuyQuantity"],
              },
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
        ]);
        return details;
      },
    },
  }),
});

const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: () => ({
    addStock: {
      type: StockType,
      args: {
        name: { type: GraphQLString },
        transactionType: { type: StatusType },
        quantity: { type: GraphQLInt },
        amount: { type: GraphQLInt },
      },
      async resolve(parent, { name, transactionType, amount, quantity }) {
        const newStock = new StockModel();
        newStock.name = name;
        newStock.transactionType = transactionType;

        if (transactionType === "buy") {
          newStock.buyAmount = amount;
          newStock.buyQuantity = quantity;

          return await newStock.save();
        } else {
          newStock.sellAmount = amount;
          newStock.sellQuantity = quantity;

          return await newStock.save();
        }
      },
    },
  }),
});

module.exports = new GraphQLSchema({
  mutation,
  query: RootQueryType,
});
