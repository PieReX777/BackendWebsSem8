import express from 'express';
import cors from 'cors';
import db from './app/models/index.js';
import authRoutes from './app/routes/auth.routes.js';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración básica
app.use(cors());
const corsOptions = {
  origin: [
    'https://frontendwebsem8-zea.onrender.com', // URL de tu frontend en Render
    'http://localhost:3000' // Para desarrollo local
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Ruta de verificación
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend funcionando correctamente',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date()
  });
});

app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);

// Inicialización simple
const startServer = async () => {
  try {
    // 1. Conectar a la base de datos
    await db.sequelize.authenticate();
    console.log('✅ Conectado a PostgreSQL en Render');
    
    // 2. Crear tablas automáticamente (solo en desarrollo)
    if (process.env.NODE_ENV !== 'production') {
      await db.sequelize.sync({ alter: true });
    } else {
      await db.sequelize.sync(); // En producción solo crea si no existen
    }
    console.log('✅ Tablas sincronizadas');
    
    // 3. Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor listo en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar:', error);
    process.exit(1);
  }
};

startServer();