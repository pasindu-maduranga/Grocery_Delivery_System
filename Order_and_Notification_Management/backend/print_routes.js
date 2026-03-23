const app = require('./server.js');

function printRoutes(app) {
  const routes = [];
  app._router.stack.forEach(middleware => {
    if (middleware.route) { // routes registered directly on the app
      routes.push(middleware.route.path);
    } else if (middleware.name === 'router') { // router middleware 
      middleware.handle.stack.forEach(handler => {
        let route;
        if (handler.route) route = handler.route;
        if (route && route.path) {
          routes.push(route.path);
        }
      });
    }
  });
  console.log('Registered Routes:', routes);
}

printRoutes(app);
process.exit(0);
