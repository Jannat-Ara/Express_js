const { validationResult } = require("express-validator");
const { success, failure } = require("../util/common");
const UserModel = require("../model/User");

class UserController {
    async getAll(req, res) {
        try {
            const users = await UserModel.find({});
            if (users.length > 0) {
                return res.status(200).send(
                    success("Successfully received all users", {
                        result: users,
                        total: users.length,
                    })
                );
            }
            return res.status(400).send(failure("No users were found"));
        } catch (error) {
            console.log(error);
            return res
                .status(400)
                .send(failure("Internal server error"));
        }
    }

    async getOneById(req, res) {
        try {
            const { id } = req.params;
            const user = await UserModel.findById({ _id: id });
            if (user) {
                return res
                    .status(200)
                    .send(success("Successfully received the user", user));
            } else {
                return res.status(200).send(failure("User does not exist"));
            }
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
            const { name, username, email, role, phone } = req.body;

            const emailCheck = await UserModel.findOne({ email: email });
            if (emailCheck) {
                return res
                    .status(400)
                    .send(failure("User with email already exists"));
            }
            const user = await UserModel.create({
                name: name,
                username: username,
                email: email,
                role: role,
                phone: phone
            });
            if (user) {
                return res
                    .status(200)
                    .send(success("Successfully added the user", user));
            }
            return res
                .status(400)
                .send(failure("Failed to add the user"));
        } catch (error) {
            console.log(error);
            return res
                .status(400)
                .send(failure("Internal server error"));
        }
    }
}

module.exports = new UserController();