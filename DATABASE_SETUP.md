# Nexus CRM - Database Setup Guide

## MongoDB Setup Options

You have two options to set up MongoDB for this CRM:

### Option 1: MongoDB Cloud (Atlas) - Recommended ✅

1. **Create a free MongoDB Atlas account**:
   - Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
   - Sign up for a free account

2. **Create a new cluster**:
   - Choose the FREE tier (M0)
   - Select a cloud provider and region close to you
   - Click "Create Cluster"

3. **Create a database user**:
   - Go to "Database Access" in the left menu
   - Click "Add New Database User"
   - Choose password authentication
   - Username: `nexusadmin`
   - Password: Generate a strong password (save it!)
   - Set privileges to "Read and write to any database"

4. **Whitelist your IP address**:
   - Go to "Network Access" in the left menu
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0) for development
   - NOTE: In production, use specific IP addresses

5. **Get your connection string**:
   - Go back to "Database" (Clusters)
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like):
     ```
     mongodb+srv://nexusadmin:<password>@cluster0.xxxxx.mongodb.net/
     ```

6. **Update your .env file**:
   ```env
   MONGODB_URI=mongodb+srv://nexusadmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/nexus-crm?retryWrites=true&w=majority
   ```
   Replace:
   - `YOUR_PASSWORD` with your actual password
   - `cluster0.xxxxx` with your actual cluster address
   - Add `/nexus-crm` as the database name

### Option 2: Local MongoDB Installation

#### Windows:

1. **Download MongoDB**:
   - Go to [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
   - Download MongoDB Community Server for Windows
   - Choose the latest stable version (e.g., 7.0.x)

2. **Install MongoDB**:
   - Run the installer
   - Choose "Complete" installation
   - Install as a Windows Service (recommended)
   - Install MongoDB Compass (optional GUI tool)

3. **Verify Installation**:
   ```powershell
   mongod --version
   ```

4. **Start MongoDB** (if not running as service):
   ```powershell
   mongod --dbpath "C:\data\db"
   ```

5. **Your .env file should have**:
   ```env
   MONGODB_URI=mongodb://localhost:27017/nexus-crm
   ```

#### macOS:

```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify
mongosh
```

#### Linux (Ubuntu/Debian):

```bash
# Import MongoDB public GPG Key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Create list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update and install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Testing Your Connection

After setup, test your connection:

```bash
cd BACKEND
npm run dev
```

You should see:
```
✅ MONGODB connected !! DB HOST: ...
🚀 Server is running at port: 8000
```

## Troubleshooting

### Error: "Invalid scheme, expected connection string to start with mongodb://"
- Check that your MONGODB_URI in .env starts with `mongodb://` or `mongodb+srv://`
- Make sure there are no extra spaces or quotes

### Error: "connect ECONNREFUSED 127.0.0.1:27017"
- MongoDB is not running locally
- Start MongoDB service or use MongoDB Atlas instead

### Error: "MongoServerError: bad auth"
- Check your username and password in the connection string
- Make sure the user exists in MongoDB Atlas

### Error: "Connection timeout"
- Check your Network Access whitelist in MongoDB Atlas
- Verify your internet connection

## Quick Start (MongoDB Atlas - 5 minutes)

```bash
# 1. Sign up at https://www.mongodb.com/cloud/atlas/register
# 2. Create free cluster (M0)
# 3. Create database user
# 4. Whitelist IP: 0.0.0.0/0
# 5. Get connection string
# 6. Update BACKEND/.env:

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nexus-crm?retryWrites=true&w=majority

# 7. Start backend
cd BACKEND
npm run dev
```

## Need Help?

- MongoDB Atlas Documentation: https://docs.atlas.mongodb.com/
- MongoDB Installation Guide: https://docs.mongodb.com/manual/installation/
- MongoDB Connection Strings: https://docs.mongodb.com/manual/reference/connection-string/
