const appRouter = require('../../server');
const supertest = require('supertest');
const BASE_URL = '/api/v1';

describe('GET / ', () => {
  test('It should respond with Resource not found', async () => {
    const response = await supertest(appRouter).get('/');

    expect(response.body).toEqual({
      message: 'Resource not found on terp API',
    });
    expect(response.statusCode).toBe(404);
  });
});

describe('GET / ', () => {
  test('It should get all users', async () => {
    const response = await supertest(appRouter).get(`${BASE_URL}/users/auth`);

    expect(response.body).toHaveProperty('users');
    expect(response.statusCode).toBe(200);
  });
});

describe('GET / ', () => {
  test('It should get single user', async () => {
    const response = await supertest(appRouter).get(`${BASE_URL}/users/auth/1`);

    expect(response.body).toHaveProperty('user');
    expect(response.statusCode).toBe(200);
  });
});
