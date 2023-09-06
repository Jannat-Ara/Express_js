const { validationResult } = require("express-validator");
const { success, failure } = require("../util/common");
const ProductModel = require("../model/Product");

class Product {
    async getAll(req, res) {
        try {
            //Adding Pagination
            const page = Number(req.query.page)||1;
            const productLimit = Number(req.query.limit)||10;

            const skip = (page -1 ) * productLimit;            


            const products = await ProductModel.find({})
                                               .skip(skip)
                                               .limit(productLimit);

            
            if (products.length > 0) {
                return res.status(200).send(
                    success("Successfully received all products", {
                        result: products,
                        total: products.length,
                    })
                );
            }
            return res.status(400).send(failure("No products were found"));
        } catch (error) {
            console.log(error);
            return res
                .status(400)
                .send(failure("Internal server error"));
        }
    }

    async create(req, res) {
        try {
            const validation = validationResult(req).array();
            if (validation.length > 0) {
                return res
                        .status(400)
                        .send(failure("Failed to add the user", validation));
            }
            const { title, description, price, stock,discountPercentage,rating,category } = req.body;


            const Product = await ProductModel.create({
                title: title,
                description: description,
                price: price,
                stock: stock,
                discountPercentage:discountPercentage,
                rating:rating,
                category:category
            });


            if (Product) {
                return res
                    .status(200)
                    .send(success("Successfully added the Product", Product));
            }
            return res
                .status(400)
                .send(failure("Failed to add the Product"));
        } catch (error) {
            console.log(error);
            return res
                .status(400)
                .send(failure("Internal server error"));
        }
    }

    async getProductByID(req, res) {
        try {
          const { id } = req.query;
          const product = await ProductModel.find({_id:id});

          if (product) {
            return res.status(200).send(success("Great! Here is the searched Product.", product));
          } else {
            return res.status(400).send(failure("Failed to find the Product."));
          }
        } catch (error) {
          console.log(error);
          return res.status(500).send(failure("Internal server error"));
        }
    }

    async deleteProductByID(req,res){
        const{id} =req.query;
        try{
             const deleteItemResult = await ProductModel.deleteOne({_id:id});
            if(deleteItemResult){
                return res
                      .status(200)
                      .send(success('Item deleted Successfully',deleteItemResult));
            }
            else{
                return res
                        .status(400)
                        .send(failure('Item not found!'));
            }
        }
        catch(error){
                return res
                       .status(500)
                       .send(failure('Server error...'));
        }
    }
}

module.exports = new Product();