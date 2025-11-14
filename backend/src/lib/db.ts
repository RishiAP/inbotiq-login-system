import mongoose from 'mongoose';

export async function connect(): Promise<void> {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI not set in environment');
    }
    const connection = mongoose.connection;

    // Attach listeners before connecting so we don't miss events
    connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    connection.once('open', () => {
      console.log('Connected to MongoDB');
    });

    await mongoose.connect(uri);

    // If connection is already open, log immediately
    if (connection.readyState === 1) {
      console.log('Connected to MongoDB (readyState=1)');
    }
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export function disconnect(): Promise<void> {
  return mongoose.disconnect();
}
