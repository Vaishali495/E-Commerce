const mongoose = require('mongoose');

async function connectMongoDb(url) {
    mongoose.connect(url)
        .then(() => {
            console.log('MongoDB connected');
        })
        .catch((error) => {
            console.error('Error in MongoDB connection:', error);
        });
}

module.exports = {
    connectMongoDb,
}