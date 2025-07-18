const express = require("express");
const {
  register,
  loginUser,
  logout,
  getMyProfileDetails,
  updateProfile,
  changePassword,
  updateProfilePic,
  forgetPassword,
  resetPassword,
  addToPlaylist,
  removeFromPlayList,
  getAllUsers,
  updateRole,
  deleteUser,
  deleteMyProfile,
} = require("../Controllers/userController");
const { isAuthenticatedUser, authorizeAdmin } = require("../MiddleWare/Authentication");
const { singleUpload } = require("../MiddleWare/multer");

const router = express.Router();

//register user

router.route("/register").post(singleUpload, register);

//login

router.route("/login").post(loginUser);
//logout
router.route("/logout").get(logout);

//get profile

router.route("/me").get(isAuthenticatedUser, getMyProfileDetails);
router.route("/me").delete(isAuthenticatedUser, deleteMyProfile);

//change password

router.route("/changepassword").put(isAuthenticatedUser, changePassword);

//update profile

router.route("/updateprofile").put(isAuthenticatedUser,singleUpload, updateProfile);

//update profile pic

router.route("/updateprofilepic").put(isAuthenticatedUser,singleUpload, updateProfilePic);

//forget password
router.route("/forgetpassword").post(forgetPassword);

//reset password

router.route("/resetpassword/:token").put(isAuthenticatedUser, resetPassword);

//add to playlist

router.route("/addtoplaylist").post(isAuthenticatedUser, addToPlaylist);

//remove playlistzzzz
router.route("/removefromplaylist").delete(isAuthenticatedUser, removeFromPlayList);


//Admin routes

router.route("/admin/users").get(isAuthenticatedUser,authorizeAdmin, getAllUsers);

//update user roles

router.route("/admin/user/:id").put(isAuthenticatedUser,authorizeAdmin, updateRole).delete(isAuthenticatedUser,authorizeAdmin,deleteUser);



module.exports = router;
