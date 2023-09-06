const express = require("express");
const routes = express();
const UserController = require("../controller/userController");
const { userValidator } = require("../middleware/validation_01");
const {isAuthorized ,isAdmin}= require('../middleware/auth');


routes.get("/all", UserController.getAll);
routes.get("/detail/:id", UserController.getOneById);
routes.post("/create", isAuthorized,isAdmin,userValidator.create, UserController.create);

module.exports = routes;