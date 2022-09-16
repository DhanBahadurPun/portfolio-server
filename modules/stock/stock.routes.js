const router = require("express").Router();
const StockController = require("./stock.controller");
/*
router.get("/stocks", (req, res, next) => {
  StockController.getStocks()
    .then((stock) => res.json(stock))
    .catch((err) => next(err));
});
*/

router.post("/", (req, res, nex) => {
  StockController.buySellStock(req.body)
    .then((stocks) => res.status(200).json(stocks))
    .catch((err) => next(err));
});

router.get("/", (req, res, next) => {
  StockController.getBuySellStock()
    .then((stocks) => res.status(200).json(stocks))
    .catch((err) => next(err));
});

router.get("/sell", (req, res, next) => {
  StockController.getSellStocks()
    .then((stock) => res.json(stock))
    .catch((err) => next(err));
});

router.get("/buy", (req, res, next) => {
  StockController.getBuyStocks()
    .then((stock) => res.json(stock))
    .catch((err) => next(err));
});

router.get("/total-buy", (req, res, next) => {
  StockController.totalBuy()
    .then((stock) => res.json(stock))
    .catch((err) => next(err));
});

router.get("/total-sell", (req, res, next) => {
  StockController.totalSell()
    .then((stock) => res.json(stock))
    .catch((err) => next(err));
});

module.exports = router;
