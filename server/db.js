import mongoose from 'mongoose';
import Event from './models/Event.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/analytics';

// Function to seed mock data if database is empty
async function seedMockData() {
  try {
    const count = await Event.countDocuments();
    if (count === 0) {
      console.log('Database is empty. Seeding mock tracking data...');
      
      const mockSessionId1 = 'mock-session-alpha-12345';
      const mockSessionId2 = 'mock-session-beta-67890';
      
      const mockEvents = [
        {
          session_id: mockSessionId1,
          event_type: 'page_view',
          page_url: 'http://localhost:3000/demo/index.html',
          timestamp: new Date(Date.now() - 3600 * 1000)
        },
        {
          session_id: mockSessionId1,
          event_type: 'click',
          page_url: 'http://localhost:3000/demo/index.html',
          timestamp: new Date(Date.now() - 3000 * 1000),
          x: 180,
          y: 220
        },
        {
          session_id: mockSessionId1,
          event_type: 'click',
          page_url: 'http://localhost:3000/demo/index.html',
          timestamp: new Date(Date.now() - 2500 * 1000),
          x: 420,
          y: 235
        },
        {
          session_id: mockSessionId1,
          event_type: 'page_view',
          page_url: 'http://localhost:3000/demo/index.html#features',
          timestamp: new Date(Date.now() - 2000 * 1000)
        },
        {
          session_id: mockSessionId1,
          event_type: 'click',
          page_url: 'http://localhost:3000/demo/index.html#features',
          timestamp: new Date(Date.now() - 1500 * 1000),
          x: 120,
          y: 340
        },
        {
          session_id: mockSessionId2,
          event_type: 'page_view',
          page_url: 'http://localhost:3000/demo/index.html#pricing',
          timestamp: new Date(Date.now() - 1800 * 1000)
        },
        {
          session_id: mockSessionId2,
          event_type: 'click',
          page_url: 'http://localhost:3000/demo/index.html#pricing',
          timestamp: new Date(Date.now() - 1200 * 1000),
          x: 480,
          y: 220
        }
      ];

      await Event.insertMany(mockEvents);
      console.log('Database successfully seeded with mock data.');
    }
  } catch (error) {
    console.error('Error seeding mock data:', error);
  }
}

// Connect to MongoDB
export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');
    await seedMockData();
  } catch (err) {
    console.error('MongoDB connection error on startup:', err);
  }
}
