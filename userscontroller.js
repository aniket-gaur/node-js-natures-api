const User = require('../models/usermodel');

exports.getAllUsers = async (req, res) => {
  const users = await User.find();
  try {
    res.status(200).json({
      status: 'success',
      results: users.length,
      requestedAt: req.requestTime,
      data: {
        users,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'error',
      message: 'no data to show ',
    });
  }
};
exports.getUser = (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'no data to show ',
  });
};
exports.updateUser = (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'no data to show ',
  });
};
exports.deleteUser = (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'no data to show ',
  });
};
