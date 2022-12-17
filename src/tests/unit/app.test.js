const appRouter = require('../../server');
const supertest = require('supertest');
const dotenv = require('dotenv');
const BASE_URL = '/api/v1';

dotenv.config();

describe('GET / ', () => {
  test('It should fail on login without username or password', async () => {
    const response = await supertest(appRouter).post(
      `${BASE_URL}/users/auth/login`
    );

    expect(response.body).toEqual({
      server: {
        status: false,
        message: 'Invalid request payload',
      },
      errors: [
        {
          field: 'username',
          message: 'Username is a required field',
        },
        {
          field: 'password',
          message: 'Password is a required field',
        },
      ],
    });
    expect(response.statusCode).toBe(422);
  });
});

describe('GET / ', () => {
  test('It should fail to login with wrong username', async () => {
    const data = {
      username: 'test@test.com',
      password: 'testpassword',
    };
    const response = await supertest(appRouter)
      .post(`${BASE_URL}/users/auth/login`)
      .send(data);

    expect(response.body).toEqual({
      server: {
        status: false,
        message: 'Invalid username provided.',
      },
    });
    expect(response.statusCode).toBe(400);
  });
});

describe('GET / ', () => {
  test('It should fail to login with wrong password', async () => {
    const data = {
      username: process.env.SUPER_ADMIN_EMAIL,
      password: 'testpassword',
    };
    const response = await supertest(appRouter)
      .post(`${BASE_URL}/users/auth/login`)
      .send(data);

    expect(response.body).toEqual({
      server: {
        status: false,
        message: 'Wrong username or password.',
      },
    });
    expect(response.statusCode).toBe(400);
  });
});

describe('GET / ', () => {
  test('It should login with  email address', async () => {
    const data = {
      username: process.env.SUPER_ADMIN_EMAIL,
      password: process.env.SUPER_ADMIN_PASSWORD,
    };
    const response = await supertest(appRouter)
      .post(`${BASE_URL}/users/auth/login`)
      .send(data);

    expect(response.body).toHaveProperty('access_token');
    expect(response.statusCode).toBe(200);
  });
});
