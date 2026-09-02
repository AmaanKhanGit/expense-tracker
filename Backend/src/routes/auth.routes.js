const express = require("express");
const authController = require("../controllers/auth.controller");

const router = express.Router();

// register route

router.post("/register",authController.registerUser);

// export router
module.exports = router;
