console.log('Starting server...');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dbConfig = require('./database-config');

const app = express();

// Enable CORS for all origins
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Serve static files (HTML, CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection with cloud/local config
const dbConfig = require('./database-config');

// Order schema for MongoDB
const orderSchema = new mongoose.Schema({
    customer_name: { type: String, required: true },
    customer_phone: { type: String, required: true },
    customer_address: { type: String, required: true },
    order_items: { type: Array, required: true },
    subtotal: { type: Number, required: true },
    delivery_fee: { type: Number, required: true },
    total: { type: Number, required: true },
    status: { type: String, default: 'pending' },
    created_at: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

function startServer() {
    // Root route - serve frontend
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });

    app.post('/api/send-order', async (req, res) => {
        try {
            const { customerName, customerPhone, customerAddress, orderItems, subtotal, deliveryFee, total } = req.body;
            
            if (!customerName || !customerPhone || !customerAddress || !orderItems) {
                return res.status(400).json({ error: 'Missing required fields' });
            }
            
            const order = new Order({
                customer_name: customerName,
                customer_phone: customerPhone,
                customer_address: customerAddress,
                order_items: orderItems,
                subtotal: subtotal,
                delivery_fee: deliveryFee,
                total: total,
                status: 'pending'
            });
            
            const savedOrder = await order.save();
            console.log(`✅ Order saved: ${customerName} - ${customerPhone} - ₹${total}`);
            
            res.json({ 
                success: true, 
                message: 'Order received successfully!',
                orderId: savedOrder._id
            });
        } catch (err) {
            console.error('❌ Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
    });

    // Get all orders endpoint - handle both /orders and /orders/
    app.get('/api/orders', async (req, res) => {
        try {
            const orders = await Order.find().sort({ created_at: -1 });
            console.log(`📊 Admin panel: ${orders.length} orders found`);
            res.json(orders);
        } catch (err) {
            console.error('❌ Error fetching orders:', err);
            return res.status(500).json({ error: 'Database error' });
        }
    });

    // Clear all orders endpoint
    app.delete('/api/clear-orders', async (req, res) => {
        try {
            const result = await Order.deleteMany({});
            console.log(`✅ Cleared ${result.deletedCount} orders`);
            res.json({ 
                success: true, 
                message: `Cleared ${result.deletedCount} orders`,
                clearedCount: result.deletedCount
            });
        } catch (err) {
            console.error('❌ Error clearing orders:', err);
            return res.status(500).json({ error: 'Database error' });
        }
    });

    // Test endpoint to verify backend is working
    app.get('/api/test', (req, res) => {
        console.log('🧪 Test endpoint called');
        res.json({ 
            message: 'Backend is working!',
            timestamp: new Date().toISOString()
        });
    });

    // Health check endpoint for Vercel
    app.get('/api/health', (req, res) => {
        res.status(200).json({ 
            status: 'healthy',
            timestamp: new Date().toISOString(),
            env: process.env.NODE_ENV || 'development',
            message: 'Server is running and healthy'
        });
    });

    // Debug endpoint to check database connection
    app.get('/api/debug-db', async (req, res) => {
        try {
            console.log('🔍 Debug: Checking database connection...');
            const count = await Order.countDocuments();
            console.log('🔍 Total orders in DB:', count);
            const all = await Order.find().limit(3);
            console.log('🔍 Sample orders:', all);
            res.json({ 
                message: 'Database debug info',
                totalOrders: count,
                sampleOrders: all,
                connection: 'Atlas'
            });
        } catch (err) {
            console.error('🔍 Debug error:', err);
            res.status(500).json({ error: err.message });
        }
    });

    
    // Delete single order endpoint
    app.delete('/api/orders/:id', async (req, res) => {
        try {
            const orderId = req.params.id;
            
            console.log(`🔍 DELETE request received for order ID: ${orderId}`);

            if (!orderId) {
                return res.status(400).json({ error: 'Invalid order ID' });
            }

            const { Types } = require('mongoose');
            if (!Types.ObjectId.isValid(orderId)) {
                return res.status(400).json({ error: 'Invalid order ID format' });
            }

            const result = await Order.findByIdAndDelete(orderId);
            if (!result) {
                return res.status(404).json({ error: 'Order not found' });
            }
            
            console.log(`✅ Order ${orderId} deleted successfully`);
            res.json({ 
                success: true, 
                message: 'Order deleted successfully',
                deletedOrderId: orderId
            });
        } catch (err) {
            console.error('❌ Error deleting order:', err);
            console.error('❌ Error stack:', err.stack);
            return res.status(500).json({ error: 'Database error: ' + err.message });
        }
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`🌐 Restaurant: http://localhost:${PORT}/index.html`);
        console.log(`📊 Admin Panel: http://localhost:${PORT}/admin.html`);
    });
}

// Connect to MongoDB and start server
const uri = `mongodb+srv://${process.env.DB_USER || dbConfig.user}:${encodeURIComponent(process.env.DB_PASSWORD || dbConfig.password)}@${process.env.DB_HOST || dbConfig.host}/${process.env.DB_NAME || dbConfig.dbName}?retryWrites=true&w=majority`;
console.log('🔗 Connecting to MongoDB with URI:', uri);

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ MongoDB Atlas connected');
    startServer();
}).catch(err => {
    console.error('❌ MongoDB connection failed:', err);
});
