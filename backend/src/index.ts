import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connect } from './lib/db';

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

async function start() {
  try {
    await connect();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();