const catchAsyncErrors = require("../MiddleWare/catchAsyncErrors");
const ErrorHandler = require("../Utils/ErrorHandler");
const sendEmail = require("../Utils/sendEmail");
const Stats = require("../Models/Stats");

exports.contact = catchAsyncErrors(async (req, res, next) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return next(new ErrorHandler("Fill all fields", 400));
  }
  const to = process.env.MY_MAIL;

  const subject = "Course From CourseBundler";

  const text = "I am ${name} and my Email is ${email}.\n${message}";

  await sendEmail(to, subject, text);

  res.status(200).json({
    success: true,
    message: "Your message has been sent",
  });
});

exports.requestCourse = catchAsyncErrors(async (req, res, next) => {
  const { name, email, course } = req.body;
  if (!name || !email || !course) {
    return next(new ErrorHandler("Fill all fields", 400));
  }
  const to = process.env.MY_MAIL;

  const subject = "Requesting Course On CourseBundler";

  const text = "I am ${name} and my Email is ${email}.\n${course}";

  await sendEmail(to, subject, text);

  res.status(200).json({
    success: true,
    message: "Your Request has been sent",
  });
});

exports.getAdminDashBoard = catchAsyncErrors(async (req, res, next) => {
  const stats = await Stats.find({})
    .sort({
      createdAt: "desc",
    })
    .limit(12);

  const statsData = [];

  for (let i = 0; i < stats.length; i++) {
    statsData.push(stats[i]);
  }

  const requireSize = 12 - stats.length;

  for (let i = 0; i < requireSize; i++) {
    statsData.unshift({
      users: 0,
      subscription: 0,
      views: 0,
    });
  }

  const usersCount = statsData[11].users;
  const subscriptionCount = statsData[11].subscription;
  const viewsCount = statsData[11].views;

  let usersPercentage = 0,
    subscriptionPercentage = 0,
    viewsPercentage = 0;

  let usersProfit = true,
    subscriptionProfit = true,
    viewsProfit = true;

  if (statsData[10].users === 0) {
    usersPercentage = usersCount * 100;
  }

  if (statsData[10].subscription === 0) {
    subscriptionPercentage = subscriptionCount * 100;
  }

  if (statsData[10].views === 0) {
    viewsPercentage = viewsCount * 100;
  } else {
    const difference = {
      users: statsData[11].users - statsData[10].users,
      subscription: statsData[11].subscription - statsData[10].subscription,
      views: statsData[11].views - statsData[10].views,
    };
    usersPercentage = (difference.users / statsData[10].users) * 100;
    subscriptionPercentage =
      (difference.subscription / statsData[10].subscription) * 100;
    viewsPercentage = (difference.views / statsData[10].views) * 100;
    if (usersPercentage < 0) {
      usersProfit = false;
    }
    if (viewsPercentage < 0) {
      viewsProfit = false;
    }
    if (subscriptionPercentage < 0) {
      subscriptionProfit = false;
    }
  }
  res.status(200).json({
    success: true,
    stats: statsData,
    usersCount,
    subscriptionCount,
    viewsCount, 
    usersPercentage,
    subscriptionPercentage,
    viewsPercentage,
    usersProfit,
    subscriptionProfit,
    viewsProfit,
  });
});
