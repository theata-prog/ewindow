'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const uuid = require('uuid');
const Picture = require('../models/picture');
const User = require('../models/user');
const multer = require('multer');
const picture = require('../models/picture');
const fs = require("fs");
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });


router.get('/new', authenticationEnsurer, csrfProtection, (req, res, next) => {
  res.render('new', { user: req.user, csrfToken: req.csrfToken() });
});

// upload.single('photo')
router.post('/',  authenticationEnsurer, csrfProtection, (req, res, next) => {
  const pictureId = uuid.v4();
  const updatedAt = new Date();
  var storage = multer.diskStorage({
    // ファイルの保存先を指定
    destination: function (req, file, cb) {
      cb(null, '/public/images/')
    }
  })
  var upload = multer({ storage: storage })

  upload.single('photo')
  console.log(req.file.originalname + 'をアップロードしました');
    Picture.create({
    pictureId: pictureId,
    pictureTitle: req.body.pictureTitle,
    photo: req.file.filename,
    statement: req.body.statement,
    createdBy: req.user.id,
    updatedAt: updatedAt,
  }).then((picture) => {
    res.redirect('/pictures/' + picture.pictureId);
    fs.renameSync(`${req.file.path}`, `${req.file.path}.jpg`);
  });
});


router.get('/:pictureId', authenticationEnsurer, csrfProtection, (req, res, next) => {
  Picture.findOne({
    include: [
      {
        model: User,
        attributes: ['userId', 'username']
      }],
    where: {
      pictureId: req.params.pictureId
    },
    order: [['updatedAt', 'DESC']]
  }).then((picture) => {
    if (picture) {
        res.render('picture', {
          user: req.user,
          picture: picture,
          users: [req.user],
          csrfToken: req.csrfToken()
        });
      } else {
        const err = new Error('指定された投稿が見つかりません');
        err.status = 404;
        next(err);
      }
  });
});

router.post('/:pictureId', authenticationEnsurer, csrfProtection, (req, res, next) => {
  Picture.findOne({
    where: {
      pictureId: req.params.pictureId
    }
  }).then((picture) => {
    if (picture && isMine(req, picture)) {
      if (parseInt(req.query.delete) === 1) {
        deletePictureAggregate(req.params.pictureId, () => {
          res.redirect('/');
        });
      } else {
        const err = new Error('不正なリクエストです');
        err.status = 400;
        next(err);
      }
    } else {
      const err = new Error('指定された投稿がないか、削除する権限がありません');
      err.status = 404;
      next(err);
    }
  });
});

function isMine(req, picture) {
  return picture && parseInt(picture.createdBy) === parseInt(req.user.id);
}

function deletePictureAggregate(pictureId, done, err) {

  Picture.findAll({
    where: { pictureId: pictureId }
  }).then(() => {
    return Picture.findByPk(pictureId).then((s) => { return s.destroy(); });
  }).then(() => {
    if (err) return done(err);
    done();
  });
}

router.deletePictureAggregate = deletePictureAggregate;

module.exports = router;