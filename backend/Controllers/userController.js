const catchAsyncErrors = require("../MiddleWare/catchAsyncErrors");
const ErrorHandler = require("../Utils/ErrorHandler");
const User = require("../Models/UserModel");
const Course = require("../Models/CourseModel");
const sendToken = require("../Utils/SendToken");
const sendEmail = require("../Utils/sendEmail");
const getDataUri = require("../Utils/dataUri");
const crypto = require("crypto");
const cloudinary = require("cloudinary");
const Stats = require("../Models/Stats");

exports.register = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;
  const file = req.file;
  if (!name || !email || !password || !file) {
    return next(new ErrorHandler("Please Enter All Fields ", 400));
  }

  console.log(email, password);
  let user = await User.findOne({ email: email });
  console.log(email, password);
  if (user) {
    return next(new ErrorHandler("USER Already exist ", 409));
  }

  const fileUri = getDataUri(file);

  const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);

  user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: mycloud.public_id,
      url: mycloud.secure_url,
    },
  });
  console.log(email, password);
  sendToken(res, user, "Registered Successfully", 200);
});

//Login users
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please enter email and password"));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(
      new ErrorHandler("Invalid email and password\n User Does't Exist", 401)
    );
  }
  console.log("user found");

  const isPasswordMatched = await user.comparePassword(password);

  console.log(isPasswordMatched);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  sendToken(res, user, `Welcome back ${user.name}`, 200);
});

//log-out users

exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.status(200).cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  res.status(200).json({
    success: true,
    message: "Logged Out Successfully",
  });
});

//get user details

exports.getMyProfileDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
});

// Change User password
exports.changePassword = catchAsyncErrors(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return next(new ErrorHandler("Please enter all fields", 400));
  }
  console.log(oldPassword);

  const user = await User.findById(req.user._id).select("+password");

  const isPasswordMatched = await user.comparePassword(oldPassword);
  console.log(isPasswordMatched);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Old password is incorrect", 400));
  }

  user.password = newPassword;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password Update Successfully",
  });
});

//update profiles

exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const { name, email } = req.body;

  const user = await User.findById(req.user._id);
  if (name) {
    user.name = name;
  }
  if (email) {
    user.email = email;
  }
  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile Update Successfully",
  });
});

//update profiles pic

exports.updateProfilePic = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const file = req.file;

  const fileUri = getDataUri(file);

  const mycloud = await cloudinary.v2.uploader.upload(fileUri.content);
  await cloudinary.v2.uploader.destroy(user.avatar.public_id);

  user.avatar = {
    public_id: mycloud.public_id,
    url: mycloud.secure_url,
  };
  await user.save();
  res.status(200).json({
    success: true,
    message: "Profile Update Successfully",
  });
});

// Forget Password
exports.forgetPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  // Get ResetPassword Token

  const resetToken = await user.getResetToken();
  await user.save();
  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}password/reset/${resetToken}`;

  //
  const message = `Your password reset token is :[] \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it.`;

  await sendEmail({
    email: user.email,
    subject: `CourseBundler Password Recovery`,
    message,
  });
  res.status(200).json({
    success: true,
    message: `Email sent to ${user.email} successfully`,
  });
});

// Resetting the  Password
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params;
  // creating token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(
      new ErrorHandler(
        "Reset Password Token is invalid or has been expired",
        400
      )
    );
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Reset Password Successfully",
  });
});

//add to playlist

exports.addToPlaylist = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const course = await Course.findById(req.body.id);
  if (!course) {
    return next(new ErrorHandler("Invalid Course Id", 404));
  }

  const itemExist = user.playlist.find((item) => {
    if (item.course.toString() === course._id.toString()) {
      return true;
    }
  });
  if (itemExist) {
    return next(new ErrorHandler("Item Already exist", 409));
    //409------the server cannot fulfill the request because the request conflicts with the server's existing data.
  }

  user.playlist.push({
    course: course._id,
    poster: course.poster.url,
  });
  await user.save();

  res.status(200).json({
    success: true,
    message: "Added to Playlist",
  });
});

//remove from playlist

exports.removeFromPlayList = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const course = await Course.findById(req.query.id);
  if (!course) {
    return next(new ErrorHandler("Invalid Course Id", 404));
  }

  const newPlaylist = user.playlist.filter((item) => {
    if (item.course.toString() !== course._id.toString()) {
      return item;
    }
  });

  user.playlist = newPlaylist;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Remove from Playlist",
  });
});

exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find({});
  res.status(200).json({
    success: true,
    users,
  });
});

exports.updateRole = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  if (user.role === "user") {
    user.role = "admin";
  } else {
    user.role = "user";
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "Role Updated Successfully",
  });
});

exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
});
exports.deleteMyProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  // Cancel Subscription
  await user.deleteOne();

  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Profile Deleted Successfully",
    });
});

User.watch().on("change", async () => {
  const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(1);

  const subscription = await User.find({
    "subscription.status": "active",
  });

  //stats[0].users = await User.countDocuments();
  // stats[0].subscription = subscription.length;
  // stats[0].createdAt = new Date(Date.now());

  //await stats[1].save();
});
