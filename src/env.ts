import dotenv from 'dotenv';

const { error } = dotenv.config();

if (error) {
  throw error;
}
