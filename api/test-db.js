import mongoose from "mongoose";

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    try {
        await mongoose.connect(`mongodb+srv://admin:${encodeURIComponent('Kaviyashree@24')}@cluster0.ummyuou.mongodb.net/hotelusers?retryWrites=true&w=majority`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        // Get all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);
        
        // Try to find orders in different possible collections
        let ordersData = {};
        
        for (let collName of collectionNames) {
            try {
                const collection = mongoose.connection.db.collection(collName);
                const count = await collection.countDocuments();
                const sample = await collection.findOne();
                ordersData[collName] = { count, sample };
            } catch (e) {
                ordersData[collName] = { error: e.message };
            }
        }
        
        res.json({
            status: 'Connected to MongoDB',
            database: 'hotelusers',
            collections: collectionNames,
            data: ordersData
        });
        
    } catch (err) {
        res.status(500).json({ 
            error: err.message,
            status: 'Connection failed'
        });
    }
}