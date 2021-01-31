'use strict';
const request = require('supertest');
const app = require('../app');
const passportStub = require('passport-stub');
const User = require('../models/user');
const Picture = require('../models/picture');

describe('/login', () => {
    beforeAll(() => {
        passportStub.install(app);
        passportStub.login({ username: 'testuser' });
    });

    afterAll(() => {
        passportStub.logout();
        passportStub.uninstall(app);
    });

    test('ログイン時はユーザー名が表示される', () => {
        return request(app)
            .get('/login')
            .expect(/testuser/)
            .expect(200);
    });
});

