// Database configuration for MongoDB
module.exports = {
    host: 'cluster0.ummyuou.mongodb.net',
    user: 'admin',
    password: 'Kaviyashree@24',
    dbName: 'hotelusers'
};

// Get MongoDB connection string
const getMongoURI = (config) => {
    const { host, dbName, user, password } = config;
    
    if (user && password) {
        // For MongoDB Atlas
        return `mongodb://${user}:${password}@${host}/${dbName}?retryWrites=true&w=majority`;
    } else {
        // For local development
        return `mongodb://localhost:27017/${dbName}`;
    }
};
