const { promisify } = require('util');

const User = require('../models/usermodel');
const catchasync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const Apperror = require('.././app-errror');
const sendEmail = require('../utils/email');

// const { user } = require('../routes/userRouter')
const time = '49d';
// const JWT_SECRET = 'myaniketgaurisverygoodandhasagoodnature';
const signtoken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: time,
  });
};
exports.signup = catchasync(async (req, res, next) => {
  const newuser = await User.create({
    //the big diff btw req.body and this code is that user can give only selected fields not the other fields
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
    // passwordresettoken: req.body.passwordresettoken,
  });

  const token = signtoken(newuser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      User: newuser,
    },
  });
  next();
});

exports.login = catchasync(async (req, res, next) => {
  const { email, password } = req.body;
  //check email or password exist or not

  if (!email || !password) {
    return next(Apperror('please check the email and passoerd ', 400));
  }

  //check for the email and password is correct or not

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparepassword(password, user.password))) {
    return next(new Apperror('please check the password', 401));
  }

  //generate web token and send it to the cilent
  const token = signtoken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});
exports.protect = catchasync(async (req, res, next) => {
  let token;
  //check whether there is a header is or not
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new Apperror('please check the email and password'), 401);
  }
  //verify headers

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //check if user exist or not

  const freshuser = await User.findById(decoded.id);
  // console.log(freshuser);
  if (!freshuser) {
    return next(new Apperror('user does not exist ', 404));
  }

  // check user changed password after token  is issued

  if (freshuser.comparepasswordAt(decoded.iat)) {
    return next(new Apperror('user recently changed passeord recently', 401));
  }

  req.user = freshuser;

  next();
});

//the fn will access the role through closure
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new Apperror('you do not have permissions to perform this action', 403)
      );
    }
    next();
  };
};

exports.forgetpass = catchasync(async (req, res, next) => {
  // 1. get user based on user email

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new Apperror('please check the email ', 404));
  }
  //2. generate a random web token
  const resetoken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // res.status(200).json({
  //   status: 'success',
  //   resetoken,
  // });
  //3.send it user email
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/reset/${resetoken}`;
  const message = `Forget Your password ? Please send a patch request and get the reserturl:${resetUrl},`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'your email reset token is valid for 10 min only ',
      message,
    });

    res.status(200).json({
      status: success,
      message: 'token send to the email',
    });
  } catch (err) {
    (user.passowordresettoken = undefined),
      (user.passwordresetexpiration = undefined),
      await user.save({ validateBeforeSave: false });

    return next(new Apperror('Please check the email and try again '), 404);
  }
});

exports.resetpass = (req, res, next) => {
  // Get user based on the token
  //If token is not expired , and there is a user and set the new passoword
  //Update the current passoword for the current user
  // Log the  user in send jwt token to the client
};
