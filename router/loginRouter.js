//external imports
const express = require("express");

//internal imports
const {getLogin, login, logout} = require("../controller/loginController")
const decorateHtmlResponse = require('../middleware/common/decorateHtmlResponse')
const { doLoginValidators,
    doLoginValidationHandler} = require('../middleware/login/loginValidators')
const {redirectLoggedIn} = require('../middleware/common/checkLogin.js')

const router = express.Router();

//set  page title 
const page_title = "Login";

//login page
router.get("/", decorateHtmlResponse(page_title),redirectLoggedIn, getLogin);

//post login
router.post("/", decorateHtmlResponse(page_title) , doLoginValidators,
    doLoginValidationHandler,
     login);


//logout
router.delete("/", logout)

module.exports = router; 