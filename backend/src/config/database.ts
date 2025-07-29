import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI!);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
 
    mongoose.connection.on('error', (error) => {
      console.error(' MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.log(' MongoDB disconnected');
    });


    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error: any) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;
