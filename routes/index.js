'use strict';
const express = require('express');
const router = express.Router();
const Picture = require('../models/picture');
const moment = require('moment-timezone');
const picture = require('../models/picture');

/* GET home page. */
router.get('/', (req, res, next) => {
  const title = 'E-Window';
    Picture.findAll({
      order: [['updatedAt', 'DESC']]
    }).then(pictures => {
      pictures.forEach((picture) => {
        picture.formattedUpdatedAt = moment(picture.updatedAt).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm');
      });
      res.render('index', {
        title: title,
        user: req.user,
        pictures: pictures,
      });
    });
});

module.exports = router;