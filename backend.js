console.log('Starting server...');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
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
app.use(express.static(__dirname));

// MongoDB connection with cloud/local config
const { getConfig, getMongoURI } = dbConfig;
const db = mongoose.createConnection(getMongoURI(getConfig()));

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
    // Redirect root to index.html
    app.get('/', (req, res) => {
        res.redirect('/index.html');
    });

    app.post('/send-order', async (req, res) => {
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
    app.get('/orders', async (req, res) => {
        try {
            const orders = await Order.find().sort({ created_at: -1 });
            console.log(`📊 Admin panel: ${orders.length} orders found`);
            res.json(orders);
        } catch (err) {
            console.error('❌ Error fetching orders:', err);
            return res.status(500).json({ error: 'Database error' });
        }
    });

    app.get('/orders/', async (req, res) => {
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
    app.delete('/clear-orders', async (req, res) => {
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
    app.get('/test', (req, res) => {
        console.log('🧪 Test endpoint called');
        res.json({ 
            message: 'Backend is working!',
            timestamp: new Date().toISOString()
        });
    });

    // Delete single order endpoint
    app.delete('/orders/:id', async (req, res) => {
        try {
            const orderId = req.params.id;
            
            console.log(`🔍 DELETE request received for order ID: ${orderId}`);
            console.log(`🔍 Order ID type: ${typeof orderId}`);
            console.log(`🔍 Order ID length: ${orderId ? orderId.length : 'undefined'}`);
            
            if (!orderId) {
                console.log(`❌ Invalid order ID: ${orderId}`);
                return res.status(400).json({ error: 'Invalid order ID' });
            }
            
            // Check if Order model is available
            console.log(`🔍 Order model available: ${!!Order}`);
            
            // Try to find the order first to see if it exists
            let deleteQuery;
            try {
                const ObjectId = require('mongoose').Types.ObjectId;
                deleteQuery = { _id: new ObjectId(orderId) };
                console.log(`🔍 Using ObjectId query:`, deleteQuery);
            } catch (e) {
                console.log(`🔍 ObjectId conversion failed, using string ID: ${orderId}`);
                console.log(`🔍 ObjectId conversion error:`, e.message);
                deleteQuery = { _id: orderId };
            }
            
            console.log(`🔍 Final delete query:`, deleteQuery);
            
            // Try to find the order first
            const existingOrder = await Order.findOne(deleteQuery);
            console.log(`🔍 Existing order found:`, existingOrder);
            
            if (!existingOrder) {
                console.log(`❌ Order not found with ID: ${orderId}`);
                return res.status(404).json({ error: 'Order not found' });
            }
            
            // Delete the order
            const result = await Order.findOneAndDelete(deleteQuery);
            console.log(`🔍 Delete result:`, result);
            
            if (!result) {
                console.log(`❌ Delete failed for order ID: ${orderId}`);
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
mongoose.connect(getMongoURI(getConfig()), {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ MongoDB connected');
    startServer();
}).catch(err => {
    console.error('❌ MongoDB connection failed:', err);
});
