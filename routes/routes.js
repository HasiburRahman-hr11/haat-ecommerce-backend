const productRoute = require('./productRoute');
const categoryRoute = require('./categoryRoute');
const cartRoute = require('./cartRoute');
const orderRoute = require('./orderRoute');
const authRoute = require('./authRoute');
const userRoute = require('./userRoute');

const routes = [
    {
        path: '/api/products',
        handler: productRoute
    },
    {
        path: '/api/category',
        handler: categoryRoute
    },
    {
        path: '/api/cart',
        handler: cartRoute
    },
    {
        path: '/api/orders',
        handler: orderRoute
    },
    {
        path: '/api/auth',
        handler: authRoute
    },
    {
        path: '/api/users',
        handler: userRoute
    }
]

const useRoutes = (app) => {
    routes.map(route => {
        if (route.path === '/') {
            app.get(route.path, route.handler)
        } else {
            app.use(route.path, route.handler)
        }
    })
}

module.exports = useRoutes;