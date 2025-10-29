import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully!');
  } catch (error) {
    console.error('Unable to connect to DB:', error);
  }
};


// Purpose of this file
// Create a connection to your database using Sequelize.
// Sequelize is an ORM (Object Relational Mapping) for Node.js.
// It allows you to interact with MySQL (or other DBs) using JavaScript instead of raw SQL.
// Export the connection so other parts of your project (like models) can use it.
