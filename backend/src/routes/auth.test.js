const request = require('supertest')
const bcryptjs = require('bcryptjs')
const express = require('express')

// Mock Prisma before importing the routes
jest.mock('../prisma/client', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findFirst: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
}))

const prisma = require('../prisma/client')
const authRoutes = require('./auth')

describe('Auth Routes', () => {
  let app

  beforeAll(() => {
    app = express()
    app.use(express.json())
    app.use('/auth', authRoutes)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const hashedPassword = await bcryptjs.hash('testpass123', 12)
      const newUser = {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        createdAt: new Date(),
      }

      prisma.user.findUnique.mockResolvedValueOnce(null)
      prisma.user.create.mockResolvedValueOnce(newUser)
      prisma.refreshToken.create.mockResolvedValueOnce({ token: 'refresh-token' })

      const res = await request(app)
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'testpass123',
        })

      expect(res.status).toBe(201)
      expect(res.body.data).toBeDefined()
      expect(res.body.data.user).toBeDefined()
    })

    it('should reject duplicate email', async () => {
      prisma.user.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        email: 'existing@example.com',
      })

      const res = await request(app)
        .post('/auth/register')
        .send({
          name: 'User 2',
          email: 'existing@example.com',
          password: 'testpass123',
        })

      expect(res.status).toBe(400)
      expect(res.body.error).toBeDefined()
    })

    it('should reject short password', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'short',
        })

      expect(res.status).toBe(400)
    })
  })

  describe('POST /auth/login', () => {
    it('should login user with correct credentials', async () => {
      const hashedPassword = await bcryptjs.hash('testpass123', 12)
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: hashedPassword,
        name: 'Test User',
      }

      prisma.user.findUnique.mockResolvedValueOnce(user)
      prisma.refreshToken.create.mockResolvedValueOnce({ token: 'refresh-token' })

      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpass123',
        })

      expect(res.status).toBe(200)
      expect(res.body.data).toBeDefined()
    })

    it('should reject invalid password', async () => {
      const hashedPassword = await bcryptjs.hash('correctpass', 12)
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: hashedPassword,
        name: 'Test User',
      }

      prisma.user.findUnique.mockResolvedValueOnce(user)

      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })

      expect(res.status).toBe(401)
    })

    it('should reject non-existent user', async () => {
      prisma.user.findUnique.mockResolvedValueOnce(null)

      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'testpass123',
        })

      expect(res.status).toBe(401)
    })
  })
})
