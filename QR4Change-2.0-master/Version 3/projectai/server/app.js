import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/connectdb.js';
import userRoutes from './routes/userRoutes.js'
import complaintRoutes from './routes/complaintRoutes.js'
import authorityRoutes from './routes/authorityRoutes.js'
import connectCloudinary from './config/cloudinary.js';


const DATABASE_URL = process.env.DATABASE_URI;  // Fixed typo
const port = process.env.PORT || 8000;         // Ensure default value if PORT is missing

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/user",userRoutes);
app.use("/api/complaint",complaintRoutes);
app.use("/api/authority",authorityRoutes)


connectDB(DATABASE_URL);
connectCloudinary()
  .then(() => console.log('Cloudinary connected'))
  .catch((err) => console.error('Cloudinary connection failed:', err));


app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`); // Fixed 'locahost' typo
});
