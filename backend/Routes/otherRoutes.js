const express = require("express");
const {
  contact,
  requestCourse,
  getAdminDashBoard,
} = require("../Controllers/otherControllers");

const  {isAuthenticatedUser,authorizeAdmin}= require("../MiddleWare/Authentication");


const router = express.Router();

//contact form'

router.route("/contact").post(contact);

//requesting course

router.route("/requestcourse").post(requestCourse);

//get admin dashboard

router.route("/admin/stats").get(isAuthenticatedUser,authorizeAdmin ,getAdminDashBoard);

module.exports = router;
