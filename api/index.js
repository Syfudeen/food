import mongoose from "mongoose";

const app = {
  use: () => {},
  get: () => {},
  post: () => {},
  delete: () => {}
};

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

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

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

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    await connectDB();

    const { url, method } = req;

    try {
        // Health check endpoint
        if (url === '/api/health' && method === 'GET') {
            res.status(200).json({ 
                status: 'healthy',
                timestamp: new Date().toISOString(),
                env: process.env.NODE_ENV || 'development'
            });
            return;
        }

        // Test endpoint
        if (url === '/api/test' && method === 'GET') {
            res.json({ 
                message: 'API is working!',
                timestamp: new Date().toISOString()
            });
            return;
        }

        // Get all orders endpoint
        if (url === '/api/orders' && method === 'GET') {
            const orders = await Order.find().sort({ created_at: -1 });
            console.log(`📊 Admin panel: ${orders.length} orders found`);
            res.json(orders);
            return;
        }

        // Send order endpoint
        if (url === '/api/send-order' && method === 'POST') {
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
            return;
        }

        // Clear all orders endpoint
        if (url === '/api/clear-orders' && method === 'DELETE') {
            const result = await Order.deleteMany({});
            console.log(`✅ Cleared ${result.deletedCount} orders`);
            res.json({ 
                success: true, 
                message: `Cleared ${result.deletedCount} orders`,
                clearedCount: result.deletedCount
            });
            return;
        }

        // Delete single order endpoint
        if (url.startsWith('/api/orders/') && method === 'DELETE') {
            const orderId = url.split('/api/orders/')[1];
            
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
            return;
        }

        // If no route matches
        res.status(404).json({ error: 'API endpoint not found' });

    } catch (err) {
        console.error('❌ API Error:', err);
        res.status(500).json({ error: 'Database error: ' + err.message });
    }
}

// For Vercel serverless functions
export { handler as default };
