import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Debug: Check if .env file exists
const envPath = path.resolve(__dirname, '../.env');
console.log('Looking for .env at:', envPath);
console.log('.env exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  console.log('.env file content preview:', fs.readFileSync(envPath, 'utf-8').substring(0, 200));
}

// Load .env from the backend root directory
const result = dotenv.config({ path: envPath });
console.log('dotenv config result:', result.error ? result.error : 'Success');
console.log('NVIDIA_API_KEY after load:', process.env.NVIDIA_API_KEY ? 'Found' : 'Not found');


import app from "./app";
import {connectDB} from "./config/database";


const PORT = process.env.PORT || 5000;



connectDB();


app.listen(PORT,()=>{

    console.log(
        `Server running on port ${PORT}`
    );

});
