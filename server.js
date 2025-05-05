import express from 'express';
import cors from 'cors';
import db from './app/models/index.js';
import authRoutes from './app/routes/auth.routes.js';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración CORS optimizada
const corsOptions = {
  origin: [
    'https://frontendwebsem8-zea.onrender.com', // Tu frontend en Render
    'http://localhost:3000'                    // Desarrollo local
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Aplica CORS con las opciones configuradas
app.use(cors(corsOptions));

// Middlewares esenciales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de verificación de salud
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend funcionando',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Inicialización simplificada
const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Conectado a PostgreSQL');
    
    // Sincronización simple (sin alterar estructura en producción)
    await db.sequelize.sync({ force: false });
    console.log('✅ Modelos sincronizados');
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor listo en http://localhost:${PORT}`);
      console.log('🔧 Configuración CORS:');
      console.log(corsOptions);
    });
  } catch (error) {
    console.error('❌ Error al iniciar:', error);
    process.exit(1);
  }
};

startServer();