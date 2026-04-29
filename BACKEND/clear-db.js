import mongoose from 'mongoose';

const clearDatabase = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27018/nexus-crm');
    console.log('Connected to MongoDB');
    
    const result = await mongoose.connection.db.collection('users').deleteMany({});
    console.log(`Deleted ${result.deletedCount} users`);
    
    await mongoose.connection.close();
    console.log('Database cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

clearDatabase();
