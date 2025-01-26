import request from 'supertest';
import { app } from '../server';

describe('POST /api/auth/register', () => {
  // Test successful registration
  it('should register a new user and return 201 Created', async () => {
    const userData = {
      username: 'testuser',
      phoneNumber: '1234567890',
      email: 'ssedssss@example.com',
      password: 'password123'
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .set('Accept', 'application/json');


    expect(res.status).toBe(201);

  });

  // Test duplicate email registration
  it('should not register a user with existing email', async () => {
    // First registration
    const firstUserData = {
      username: 'firstuser',
      phoneNumber: '1111111111',
      email: 'duplicate@example.com',
      password: 'password123'
    };

    await request(app)
      .post('/api/auth/register')
      .send(firstUserData);

    // Try registering with same email
    const duplicateUserData = {
      ...firstUserData,
      username: 'seconduser'
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(duplicateUserData);

    expect(res.status).toBe(400);
  });

  // Test invalid input validation
  it('should validate registration inputs', async () => {
    const invalidUserData = {
      username: '', // Empty username
      phoneNumber: '123', // Invalid phone
      email: 'invalidemail', // Invalid email
      password: '123' // Too short password
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(invalidUserData);

    expect(res.status).toBe(400);
  });
});