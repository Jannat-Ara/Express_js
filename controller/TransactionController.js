const path = require('path');
const fs = require('fs');
const { validationResult } = require("express-validator");
const { success, failure } = require("../util/common");
const TransactionModel = require("../model/Transaction");
const ProductModel = require("../model/Product");



//function for the log file
function writeToLogFile(transactionDetails) {
    const logFileName = `transaction_details.json`;
    const logFilePath = path.join(__dirname, '../Server', logFileName);

    try {
        if (!fs.existsSync(path.join(__dirname, '../Server'))) {
            fs.mkdirSync(path.join(__dirname, '../Server'));
        }

        fs.writeFileSync(logFilePath, JSON.stringify(transactionDetails, null, 2));
        console.log(`Transaction details saved to ${logFileName}`);
    } catch (error) {
        console.error('Error writing to log file:', error);
    }
}

class Transaction {
    async getAll(req, res) {
        try {
            let transactions = await TransactionModel.find({})
                .populate("user", "-_id name email")
                .populate("products.product", "-_id title price rating brand total discount subtotal")
                .select("-__v");

            console.log("Purchase Data:", transactions);

            if (transactions.length > 0) {
                transactions.forEach((transaction) => {

                    writeToLogFile(transaction);
                });
                return res.status(200).json({
                    success: true,
                    message: "Successfully retrieved transactions",
                    result: transactions
                });

            } else {
                return res.status(500).send(failure('No transaction found'));
            }
        } catch (error) {
            console.error("Error:", error);
            return res.status(500).send(failure('Internal Server Error'));
        }
    }

    async create(req, res) {
        try {
            const { user, products } = req.body;
            const productsList = products.map((element) => {
                return element.product;
            });

            // Checking if all products in list from body are actually present in database
            const productsInCart = await ProductModel.find({
                _id: {
                    $in: productsList,
                },
            }).select("price discountPercentage");


            // If any of the product id is invalid, this length will fail to match
            if (productsInCart.length !== products.length) {
                return res.status(400).send(failure("All the IDs are not valid IDs"));
            }
            let totalPrice = 0;
            let discountPrice = 0;
            // Calculating total price
            //totalPrice = productsInCart.reduce((previousPrice, currentPrice, i) => {
            //    return previousPrice + currentPrice.price * products[i].quantity;
            //}, 0);//here 0 is to initialize the previousPrice as 0.
            productsInCart.forEach((productInCart, i) => {
                const productInfo = products[i];
                const productPrice = productInCart.price;
                const discountPercentage = productInCart.discountPercentage || 0;
                const discountedPrice = (1 - discountPercentage / 100) * productPrice;
                const productTotal = discountedPrice * productInfo.quantity;

                // Calculate the total for this product
                totalPrice += productTotal;

                // Calculate the discount for this product
                discountPrice += (productPrice - discountedPrice) * productInfo.quantity;
            });

            const subtotal = totalPrice - discountPrice;
            const newTransaction = await TransactionModel.create({
                user: user,
                products: products,
                total: totalPrice,
                discount: discountPrice,
                Subtotal: subtotal
            });

            if (newTransaction) {
                return res.status(200).send(
                    success("Successfully created new transaction", {
                        result: newTransaction,
                    })
                );
            }
            return res.status(400).send(failure("Failed to add transaction"));
        } catch (error) {
            console.log(error);
            return res
                .status(400)
                .send(failure("Internal server error"));
        }
    }

}

module.exports = new Transaction();