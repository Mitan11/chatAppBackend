# Chat App Backend

This is the backend service for the Chat Application.

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your actual configuration values:
   - `MONGODB_URI`: Your MongoDB connection string
   - `PORT`: Server port (default: 5001)
   - `JWT_SECRET`: Secret key for JWT authentication
   - `MODE_ENV`: Environment mode (development/production)
   - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: Your Cloudinary API key
   - `CLOUDINARY_API_SECRET`: Your Cloudinary API secret

5. Start the server:
   ```bash
   npm start
   ```

## Important Security Note

**Never commit the `.env` file to version control!** The `.env` file contains sensitive credentials and should remain local to your machine. Always use `.env.example` as a template.
