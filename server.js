import express from 'express';
import cors from 'cors';
import { Sequelize } from 'sequelize';
import db from './app/models/index.js';
import authRoutes from './app/routes/auth.routes.js';
import userRoutes from './app/routes/user.routes.js';
import 'dotenv/config';

// Configuración básica
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares esenciales (en orden correcto)
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:8080'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas básicas
app.get('/', (req, res) => {
  res.json({ 
    status: 'running',
    message: 'JWT Authentication API',
    endpoints: {
      auth: '/api/auth',
      test: '/api/test'
    }
  });
});

// Montar rutas (asegúrate que los archivos de rutas exporten router correctamente)
app.use('/api/auth', authRoutes);
app.use('/api/test', userRoutes);

// Manejo de errores (debe ir al final)
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// Inicialización
const startServer = async () => {
  try {
    // Configuración de base de datos
    const tempSequelize = new Sequelize({
      dialect: 'mysql',
      username: 'root',
      password: '',
      host: 'localhost'
    });
    
    await tempSequelize.query('CREATE DATABASE IF NOT EXISTS lab_web');
    await tempSequelize.close();

    // Sincronizar modelos
    await db.sequelize.sync({ force: false });
    console.log('✅ Database synchronized');

    // Crear roles iniciales
    const roles = await db.role.findAll();
    if (roles.length === 0) {
      await db.role.bulkCreate([
        { name: 'user' },
        { name: 'moderator' },
        { name: 'admin' }
      ]);
      console.log('✅ Default roles created');
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
};

startServer();