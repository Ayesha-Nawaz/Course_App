const express = require("express");
const {
  getAllCourses,
  createCourse,
  getCourseLectures,
  addCourseLectures,
  deleteCourse,
  deleteLectures,
} = require("../Controllers/courseController");
const { singleUpload } = require("../MiddleWare/multer");
const {
  authorizeAdmin,
  isAuthenticatedUser,
} = require("../MiddleWare/Authentication");

const router = express.Router();

//GET aLL COURSES WITHOUT LECTURES

router.route("/courses").get(getAllCourses);

//CREATE COURSE (FOR ADMIN ONLY)

router
  .route("/createcourses")
  .post(isAuthenticatedUser, authorizeAdmin, singleUpload, createCourse);

//add lectures

router
  .route("/course/:id")
  .get(isAuthenticatedUser, getCourseLectures)
  .post(isAuthenticatedUser, authorizeAdmin, singleUpload, addCourseLectures)
  .delete(isAuthenticatedUser,authorizeAdmin, deleteCourse);

  //delete lectures

  router
  .route("/deletelectures")
  .delete(isAuthenticatedUser, authorizeAdmin, deleteLectures);




module.exports = router;
