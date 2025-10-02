import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from './server.js';

// Mocking firebase/firestore
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  addDoc: vi.fn(() => Promise.resolve({ id: 'test-id' })),
}));

// Mocking axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn((url) => {
      if (url.includes('user.info')) {
        return Promise.resolve({
          data: {
            status: 'OK',
            result: [
              {
                handle: 'testuser',
                rating: 1500,
                rank: 'expert',
                friendOfCount: 100,
                maxRating: 1600,
                maxRank: 'master',
                avatar: 'test-avatar.jpg'
              }
            ]
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
    })
  }
}));

describe('POST /api/reports', () => {
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
});
