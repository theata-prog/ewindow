'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const uuid = require('uuid');
const Picture = require('../models/picture');
const User = require('../models/user');
const picture = require('../models/picture');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const multer = require('multer');
const multerGoogleStrage = require('multer-google-storage');
//GoogleStrageの設定や保存先の設定
var uploadHandler = multer({
  storage: multerGoogleStrage.storageEngine({
    autoRetry: true,
    bucket: 'ewindow-upload',
    projectId: 'ewindow',
    keyFilename: process.env.GOOGLE_CREDENTIALS,
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}_${file.originalname}`);
    }
  })
});


router.get('/new', authenticationEnsurer, csrfProtection, (req, res, next) => {
  res.render('new', { user: req.user, csrfToken: req.csrfToken() });
});

// upload.single('photo')
router.post('/', uploadHandler.single('photo'), authenticationEnsurer, csrfProtection, (req, res, next) => {
  const pictureId = uuid.v4();
  const updatedAt = new Date();
  
  //写真の情報の登録
  Picture.create({
    pictureId: pictureId,
    pictureTitle: req.body.pictureTitle,
    statement: req.body.statement,
    createdBy: req.user.id,
    updatedAt: updatedAt,
    pictureUrl: req.file.path
  }).then((picture) => {
    console.log(picture.pictureUrl);
    res.redirect('/pictures/' + picture.pictureId);
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

//削除処理
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

//投稿が本人の物か確認
function isMine(req, picture) {
  return picture && parseInt(picture.createdBy) === parseInt(req.user.id);
}

//投稿を消す関数
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