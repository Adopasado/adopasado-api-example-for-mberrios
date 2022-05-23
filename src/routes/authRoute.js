const express = require("express");
const router = express.Router();
const verifyAdmin = require("../middleware/isadmin");
const authenticationUser = require("../middleware/authentication");

const { login, register, deleteUserByEmail, getAllUsers } = require("../controllers/authController");

router.route("/").get(authenticationUser, verifyAdmin, getAllUsers);
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/delete/:id").delete(authenticationUser, verifyAdmin, deleteUserByEmail);

module.exports = router;