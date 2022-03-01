const express = require('express');
const auth = require('../../middlewares/admin/auth');
const validate = require('../../middlewares/admin/validate');
const orderValidation = require('../../validations/order.validation');
const orderController = require('../../controllers/admin/order.controller');

const router = express.Router();

router.route('/').get(auth('getOrder'), orderController.getOrderList);
router
  .route('/add')
  .get(auth('manageOrder'), (req, res) => {
    res.render('create-order', {
      title: 'Tạo đơn hàng',
    });
  })
  .post(validate(orderValidation.create), orderController.addOrders);

module.exports = router;
