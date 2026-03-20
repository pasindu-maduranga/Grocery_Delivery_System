const path = require('path');
const authRoutes = require('./authRoutes');
const paymentRoutes = require('./paymentRoutes');
const userRoutes = require('./userRoutes');
const cartRoutes = require('./cartRoutes');
const adminOrderRoutes = require('./adminOrderRoutes');
const healthRouter = require('./healthRoutes');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RapidCart - User Management & Payment API',
      version: '1.0.0',
      description: 'API for user authentication, registration, password reset, Google OAuth and payment operations'
    },
    servers: [
      {
        url: 'http://localhost:5003',     
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using Bearer scheme'
        }
      }
    }
  },
  apis: [
        path.join(__dirname, 'authRoutes.js'),
        path.join(__dirname, 'indexRoutes.js'),
        path.join(__dirname, '../routes/*.js'),
        path.join(__dirname, '../controllers/*.js')
    ] 
};

const specs = swaggerJsDoc(options);
// console.log('Swagger discovered paths:', Object.keys(specs.paths || {}));
console.log('Swagger api-endpoint: http://localhost:5003/api-docs');

module.exports = (app) => {
    app.use('/api/auth', authRoutes);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
    app.use('/api/payment', paymentRoutes);
    app.use('/api/user', userRoutes);
    app.use('/api/cart', cartRoutes);
    app.use('/api/admin/orders', adminOrderRoutes);
    app.use('/health', healthRouter);
}