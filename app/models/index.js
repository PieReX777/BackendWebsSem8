import { Sequelize } from 'sequelize';
import dbConfig from '../config/db.config.js';

// Conexión simple
const sequelize = new Sequelize(
  dbConfig.DB,
  dbConfig.USER,
  dbConfig.PASSWORD,
  {
    host: dbConfig.HOST,
    dialect: 'postgres',
    port: dbConfig.PORT,
    logging: false,
    dialectOptions: dbConfig.dialectOptions
  }
);

// Modelo de usuario mínimo
const User = sequelize.define('user', {
  username: { type: Sequelize.STRING, allowNull: false },
  email: { type: Sequelize.STRING, unique: true },
  password: { type: Sequelize.STRING }
});

// Modelo de rol mínimo
const Role = sequelize.define('role', {
  name: { type: Sequelize.STRING, unique: true }
});

// Relación simple
User.belongsToMany(Role, { through: 'user_roles' });
Role.belongsToMany(User, { through: 'user_roles' });

export default {
  sequelize,
  Sequelize,
  User,
  Role
};