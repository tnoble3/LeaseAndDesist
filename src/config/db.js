const mongoose = require('mongoose');

const connectDB = async (mongoUri) => {
    try {
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
       });
       console.log('Mongo database connected.');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};