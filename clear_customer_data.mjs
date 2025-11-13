import mongoose from 'mongoose';

async function clearCustomerData() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ramani-fashion';
    await mongoose.connect(MONGODB_URI);
    
    console.log('Connected to MongoDB');
    
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Clear customer-related collections but keep Users (admins) and Products
    const collectionsToKeep = ['users', 'products'];
    const collectionsToDelete = collections
      .map(c => c.name)
      .filter(name => !collectionsToKeep.includes(name));
    
    console.log('\nClearing collections:', collectionsToDelete);
    
    for (const collectionName of collectionsToDelete) {
      const result = await mongoose.connection.db.collection(collectionName).deleteMany({});
      console.log(`Cleared ${collectionName}: ${result.deletedCount} documents deleted`);
    }
    
    console.log('\nCustomer data cleared successfully!');
    console.log('Preserved collections:', collectionsToKeep);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

clearCustomerData();
