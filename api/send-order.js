import mongoose from "mongoose";

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

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

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
        res.status(500).json({ error: 'Database error' });
    }
}