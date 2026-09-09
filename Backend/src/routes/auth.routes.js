const express = require("express");
const authController = require("../controllers/auth.controller");

const router = express.Router();

// register user
router.post("/register", authController.registerUser);

// verify email
router.get("/verify-email/:token", authController.verifyEmail);

//login user
router.post("/login",authController.login)

// export router
module.exports = router;
