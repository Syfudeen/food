import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();

// Enable CORS for all origins
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

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

// MongoDB connection
let isConnected = false;

const connectDB = async () => {
    if (isConnected) {
        return;
    }
    
    try {
        const uri = `mongodb+srv://admin:${encodeURIComponent('Kaviyashree@24')}@cluster0.ummyuou.mongodb.net/hotelusers?retryWrites=true&w=majority`;
        
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        isConnected = true;
        console.log('✅ MongoDB Atlas connected');
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err);
        throw err;
    }
};

// Health check endpoint
app.get('/api/health', async (req, res) => {
    await connectDB();
    res.status(200).json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development'
    });
});

// Test endpoint
app.get('/api/test', async (req, res) => {
    await connectDB();
    res.json({ 
        message: 'API is working!',
        timestamp: new Date().toISOString()
    });
});

// Get all orders endpoint
app.get('/api/orders', async (req, res) => {
    try {
        await connectDB();
        const orders = await Order.find().sort({ created_at: -1 });
        console.log(`📊 Admin panel: ${orders.length} orders found`);
        res.json(orders);
    } catch (err) {
        console.error('❌ Error fetching orders:', err);
        return res.status(500).json({ error: 'Database error' });
    }
});

// Send order endpoint
app.post('/api/send-order', async (req, res) => {
    try {
        await connectDB();
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

// Clear all orders endpoint
app.delete('/api/clear-orders', async (req, res) => {
    try {
        await connectDB();
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

// Delete single order endpoint
app.delete('/api/orders/:id', async (req, res) => {
    try {
        await connectDB();
        const orderId = req.params.id;
        
        console.log(`🔍 DELETE request received for order ID: ${orderId}`);

        if (!orderId) {
            return res.status(400).json({ error: 'Invalid order ID' });
        }

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
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

export default app;
