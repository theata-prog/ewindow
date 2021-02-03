'use strict';
const express = require('express');
const router = express.Router();
const Picture = require('../models/picture');

/* GET home page. */
router.get('/', (req, res, next) => {
  const title = '展示写（舎）';
  //投稿を取得して表示
  if (req.user) {
    Picture.findAll({
      order: [['updatedAt', 'DESC']]
    }).then(pictures => {
      res.render('index', {
        title: title,
        user: req.user,
        pictures: pictures
      });
    });
  } else {
    res.render('index', { title: title, user: req.user });
  }
});

module.exports = router;