const contactService = require('../services/contactService');
const catchAsync = require('../utils/catchAsync');

const submit = catchAsync(async (req, res) => {
  const result = await contactService.submitContact(req.body);
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

module.exports = { submit };
