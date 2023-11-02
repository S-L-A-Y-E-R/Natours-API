const multer = require("multer");
const sharp = require("sharp");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/usersmodel");
const AppError = require("../utils/appError");
const { deleteOne, updateOne, getOne, getAll } = require("./factoryHandler");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Please upload only images", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.updateUserPhoto = upload.single("photo");

const resizeUserPhoto = async (req, res, next) => {
  if (!req.file) next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/images/${req.file.filename}`);

  next();
};

exports.getAllUsers = getAll(User);

exports.getOneUser = getOne(User);

exports.deleteUser = deleteOne(User);

exports.updateUser = updateOne(User);

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passowordConfirm) {
    return next(
      new AppError(
        "You are not allowed to update the password using this route"
      )
    );
  }

  const { name, email } = req.body;

  const filteredBody = { name, email };
  if (req.file) filteredBody.photo = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: updatedUser,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;

  next();
};
