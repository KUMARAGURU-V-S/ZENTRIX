import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from './server.js';

// Mocking firebase/firestore
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  addDoc: vi.fn(() => Promise.resolve({ id: 'test-id' })),
}));

// Mocking axios
const mockAxios = vi.fn();
vi.mock('axios', () => ({
  default: {
    get: mockAxios
  }
}));

// Mock Gemini AI
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn(() => ({
    getGenerativeModel: vi.fn(() => ({
      startChat: vi.fn(() => ({
        sendMessage: vi.fn(() => Promise.resolve({
          response: { text: () => 'Mock AI response' }
        }))
      }))
    }))
  }))
}));

describe('API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /codeforces/:username', () => {
    it('should return user data for valid username', async () => {
      mockAxios.mockResolvedValueOnce({
        data: {
          status: 'OK',
          result: [{
            handle: 'testuser',
            rating: 1500,
            rank: 'expert'
          }]
        }
      });

      const response = await request(app)
        .get('/codeforces/testuser');

      expect(response.status).toBe(200);
      expect(response.body.handle).toBe('testuser');
      expect(response.body.rating).toBe(1500);
      expect(mockAxios).toHaveBeenCalledWith('https://codeforces.com/api/user.info?handles=testuser');
    });

    it('should return 404 for non-existent user', async () => {
      mockAxios.mockResolvedValueOnce({
        data: {
          status: 'FAILED',
          comment: 'handles: User not found'
        }
      });

      const response = await request(app)
        .get('/codeforces/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('Codeforces user not found');
    });

    it('should handle API errors gracefully', async () => {
      mockAxios.mockRejectedValueOnce(new Error('Network error'));

      const response = await request(app)
        .get('/codeforces/testuser');

      expect(response.status).toBe(500);
      expect(response.body.message).toContain('Error fetching Codeforces data');
    });

    it('should handle special characters in username', async () => {
      mockAxios.mockResolvedValueOnce({
        data: {
          status: 'OK',
          result: [{
            handle: 'test_user123',
            rating: 1200
          }]
        }
      });

      const response = await request(app)
        .get('/codeforces/test_user123');

      expect(response.status).toBe(200);
      expect(response.body.handle).toBe('test_user123');
    });
  });

  describe('POST /api/chat', () => {
    it('should return AI response for valid message', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ message: 'Hello AI' });

      expect(response.status).toBe(200);
      expect(response.body.reply).toBe('Mock AI response');
    });

    it('should return 400 for empty message', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ message: '' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Message is required');
    });

    it('should return 400 for missing message field', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Message is required');
    });

    it('should handle long messages', async () => {
      const longMessage = 'a'.repeat(10000);
      const response = await request(app)
        .post('/api/chat')
        .send({ message: longMessage });

      expect(response.status).toBe(200);
      expect(response.body.reply).toBe('Mock AI response');
    });

    it('should handle special characters in message', async () => {
      const response = await request(app)
        .post('/api/chat')
        .send({ message: 'Hello @#$%^&*()!' });

      expect(response.status).toBe(200);
      expect(response.body.reply).toBe('Mock AI response');
    });
  });

  describe('POST /api/reports', () => {
    beforeEach(() => {
      // Setup default mocks for Codeforces API
      mockAxios.mockImplementation((url) => {
        if (url.includes('user.info')) {
          return Promise.resolve({
            data: {
              status: 'OK',
              result: [{
                handle: 'testuser',
                rating: 1500,
                rank: 'expert',
                friendOfCount: 100,
                maxRating: 1600,
                maxRank: 'master',
                avatar: 'test-avatar.jpg'
              }]
            }
          });
        }
        if (url.includes('user.status')) {
          return Promise.resolve({
            data: {
              status: 'OK',
              result: [
                { verdict: 'OK', programmingLanguage: 'C++', problem: { contestId: 1, index: 'A', tags: ['implementation'] } },
                { verdict: 'OK', programmingLanguage: 'C++', problem: { contestId: 1, index: 'B', tags: ['graphs'] } },
                { verdict: 'WRONG_ANSWER', programmingLanguage: 'C++', problem: { contestId: 1, index: 'C', tags: ['dp'] } },
                { verdict: 'OK', programmingLanguage: 'Python', problem: { contestId: 1, index: 'C', tags: ['dp'] } },
              ]
            }
          });
        }
        return Promise.reject(new Error('Unknown URL in mock'));
      });
    });

    it('should generate a report with detailed analysis and save it to the database', async () => {
      const response = await request(app)
        .post('/api/reports')
        .send({ handle: 'testuser' });

      expect(response.status).toBe(201);
      expect(response.body.username).toBe('testuser');
      expect(response.body.id).toBe('test-id');
      expect(response.body.codeforcesData.rating).toBe(1500);
      expect(response.body.performanceMetrics.problemSolved).toBe(3);
      expect(response.body.performanceMetrics.accuracy).toBe('75.00%');
      expect(response.body.performanceMetrics.languages).toEqual(['C++', 'Python']);
      expect(response.body.strengths).toEqual(['implementation', 'graphs', 'dp']);
    });

    it('should return a 400 error if handle is not provided', async () => {
      const response = await request(app)
        .post('/api/reports')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Username (handle) is required.');
    });

    it('should handle empty handle string', async () => {
      const response = await request(app)
        .post('/api/reports')
        .send({ handle: '' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Username (handle) is required.');
    });

    it('should handle whitespace-only handle', async () => {
      const response = await request(app)
        .post('/api/reports')
        .send({ handle: '   ' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Username (handle) is required.');
    });

    it('should handle Codeforces API failure gracefully', async () => {
      mockAxios.mockRejectedValueOnce(new Error('API Error'));

      const response = await request(app)
        .post('/api/reports')
        .send({ handle: 'testuser' });

      expect(response.status).toBe(201); // Should return mock data
      expect(response.body.username).toBe('testuser');
      expect(response.body.summary).toContain('Mock analysis');
    });

    it('should handle user with no submissions', async () => {
      mockAxios.mockImplementation((url) => {
        if (url.includes('user.info')) {
          return Promise.resolve({
            data: {
              status: 'OK',
              result: [{
                handle: 'newuser',
                rating: 800,
                rank: 'pupil'
              }]
            }
          });
        }
        if (url.includes('user.status')) {
          return Promise.resolve({
            data: {
              status: 'OK',
              result: []
            }
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const response = await request(app)
        .post('/api/reports')
        .send({ handle: 'newuser' });

      expect(response.status).toBe(201);
      expect(response.body.performanceMetrics.problemSolved).toBe(0);
      expect(response.body.performanceMetrics.accuracy).toBe('0.00%');
    });

    it('should handle user with only failed submissions', async () => {
      mockAxios.mockImplementation((url) => {
        if (url.includes('user.info')) {
          return Promise.resolve({
            data: {
              status: 'OK',
              result: [{
                handle: 'strugglinguser',
                rating: 900,
                rank: 'pupil'
              }]
            }
          });
        }
        if (url.includes('user.status')) {
          return Promise.resolve({
            data: {
              status: 'OK',
              result: [
                { verdict: 'WRONG_ANSWER', programmingLanguage: 'C++', problem: { contestId: 1, index: 'A', tags: ['implementation'] } },
                { verdict: 'TIME_LIMIT_EXCEEDED', programmingLanguage: 'C++', problem: { contestId: 1, index: 'B', tags: ['graphs'] } },
              ]
            }
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const response = await request(app)
        .post('/api/reports')
        .send({ handle: 'strugglinguser' });

      expect(response.status).toBe(201);
      expect(response.body.performanceMetrics.problemSolved).toBe(0);
      expect(response.body.performanceMetrics.accuracy).toBe('0.00%');
    });

    it('should handle LeetCode platform', async () => {
      mockAxios.mockResolvedValueOnce({
        data: {
          status: 'success',
          ranking: 50000,
          totalSolved: 150,
          easySolved: 50,
          mediumSolved: 70,
          hardSolved: 30,
          acceptanceRate: 65.5
        }
      });

      const response = await request(app)
        .post('/api/reports')
        .send({ handle: 'leetcodeuser', platform: 'leetcode' });

      expect(response.status).toBe(201);
      expect(response.body.platform).toBe('leetcode');
      expect(response.body.leetcodeData.ranking).toBe(50000);
      expect(response.body.leetcodeData.totalSolved).toBe(150);
    });

    it('should return 400 for unsupported platform', async () => {
      const response = await request(app)
        .post('/api/reports')
        .send({ handle: 'testuser', platform: 'unsupported' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Platform not supported yet.');
    });

    it('should default to codeforces platform when not specified', async () => {
      const response = await request(app)
        .post('/api/reports')
        .send({ handle: 'testuser' });

      expect(response.status).toBe(201);
      expect(response.body.codeforcesData).toBeDefined();
    });

    it('should handle special characters in username', async () => {
      mockAxios.mockImplementation((url) => {
        if (url.includes('user.info')) {
          return Promise.resolve({
            data: {
              status: 'OK',
              result: [{
                handle: 'test_user_123',
                rating: 1200,
                rank: 'pupil'
              }]
            }
          });
        }
        if (url.includes('user.status')) {
          return Promise.resolve({
            data: {
              status: 'OK',
              result: [
                { verdict: 'OK', programmingLanguage: 'Java', problem: { contestId: 1, index: 'A', tags: ['math'] } }
              ]
            }
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const response = await request(app)
        .post('/api/reports')
        .send({ handle: 'test_user_123' });

      expect(response.status).toBe(201);
      expect(response.body.username).toBe('test_user_123');
    });
  });
});
