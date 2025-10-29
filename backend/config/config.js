import dotenv from 'dotenv';
dotenv.config();

export default {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql"
  }
};

// This file tells Sequelize (your ORM for Node.js) how to connect to your database depending on the environment (development, production, test).
// Sequelize needs to know:
// Database name
// Username
// Password
// Host
// Port
// Dialect (MySQL, PostgreSQL, SQLite, etc.)
// .env variables are used so you don’t hardcode sensitive info in your code.
