export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('Users', {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: Sequelize.STRING, allowNull: false },
    email: { type: Sequelize.STRING, allowNull: false, unique: true },
    password: { type: Sequelize.STRING, allowNull: false },
    createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('Users');
}

// Why use migrations
// Keeps track of database changes in a version-controlled way.
// Makes it easy to apply or revert changes consistently across development, staging, and production.
// Avoids manual table creation with SQL.


// How to run this migration
// Install Sequelize CLI (if not already):
// npm install --save-dev sequelize-cli
// Make sure your config/config.js or equivalent exists (it tells Sequelize how to connect to DB).
// Run the migration:
// npx sequelize-cli db:migrate
// This runs all pending migrations (like your Users table).
// To undo (rollback) the last migration:
// npx sequelize-cli db:migrate:undo
// This will call the down function and drop the Users table.