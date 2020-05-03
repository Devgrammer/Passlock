var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
var bcrypt = require("bcrypt");
const { check, validationResult, body } = require("express-validator");
var jwt = require("jsonwebtoken");

var userModule = require("../modules/user");
// const userdb = userModule.find({});

// const  app = express();
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require("node-localstorage").LocalStorage;
  localStorage = new LocalStorage("./scratch");
}

// create application/json parser
var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

//Middleware fro checking login access
function checkloginUser(req, res, next) {
  var userToken = localStorage.getItem("userToken");
  try {
    var decoded = jwt.verify(userToken, "loginToken");
  } catch (err) {
    res.redirect("/");
  }
  next();
}

/*Middleware for checking the email */
function checkEmail(req, res, next) {
  var email = req.body.email;
  var checkexistingemail = userModule.findOne({ email: email });
  checkexistingemail.exec((err, data) => {
    if (err) throw Error;
    if (data) {
      return res.render("signup", {
        title: "Signup",
        msg: "Email is already registered.",
      });
    }
    next();
  });
}
/*Middleware for checking the username */
function checkUsername(req, res, next) {
  var username = req.body.username;
  var checkexistinguname = userModule.findOne({ username: username });
  checkexistinguname.exec((err, data) => {
    if (err) throw Error;
    if (data) {
      return res.render("signup", {
        title: "Signup",
        msg: "Username is already taken.",
      });
    }
    next();
  });
}

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Login", msg: " " });
});

//Routing back to Homepage after logout
router.get("/logout", function (req, res, next) {
  localStorage.removeItem("userToken");
  localStorage.removeItem("loginUser");
  res.redirect("/");
});

router.post("/", function (req, res, next) {
  var username = req.body.username;
  var password = req.body.password;

  var checkUser = userModule.findOne({ username: username });

  checkUser.exec((err, data) => {
    if (err) throw Error;
    var getUserID = data._id;
    var getPassword = data.password;
    if (bcrypt.compareSync(password, getPassword)) {
      var token = jwt.sign({ userID: getUserID }, "loginToken");
      localStorage.setItem("userToken", token);
      localStorage.setItem("loginUser", username);
      res.redirect("/dashboard");
    } else {
      res.render("index", {
        title: "Login",
        msg: "Invalid Username or Password!",
      });
    }
  });
});

router.get("/dashboard", checkloginUser, function (req, res, next) {
  var loginUser = localStorage.getItem("loginUser");
  res.render("dashboard", {
    title: "Dashboard",
    loginUser: loginUser,
    msg: " ",
  });
});

/*Get Signup page */
router.get("/signup", function (req, res, next) {
  res.render("signup", { title: "Signup", msg: " " });
});

/*Get data and validation for Signup page */
router.post("/signup", checkUsername, checkEmail, urlencodedParser, function (
  req,
  res,
  next
) {
  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;
  var cpassword = req.body.cpassword;
  if (password != cpassword) {
    res.render("signup", {
      title: "Signup",
      msg: "Password not matched!",
    });
  } else {
    password = bcrypt.hashSync(req.body.password, 10);
    var userDetail = new userModule({
      username: username,
      email: email,
      password: password,
    });
    userDetail.save(function (err, doc) {
      if (err) throw Error;
      res.render("signup", {
        title: "Signup",
        msg: "User Registered Successfully!",
      });
    });
  }
});

router.get("/cat",checkloginUser, function (req, res, next) {
    var loginUser = localStorage.getItem("loginUser");
  res.render("pass_category", { title: "Password List", loginUser: loginUser });
});

router.get("/ancat",checkloginUser, function (req, res, next) {
   var loginUser = localStorage.getItem("loginUser");
  res.render("addNewCategory", {
    title: "Add New Category",
    loginUser: loginUser,
  });
});

module.exports = router;
