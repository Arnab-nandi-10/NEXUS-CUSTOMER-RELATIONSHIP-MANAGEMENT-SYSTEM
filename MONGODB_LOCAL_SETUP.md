# MongoDB Local Setup with Compass (Windows)

## Step 1: Download MongoDB Community Server

1. **Go to MongoDB Download Page**:
   - Open: https://www.mongodb.com/try/download/community
   
2. **Select Options**:
   - Version: Latest (7.0.x or 8.0.x)
   - Platform: Windows
   - Package: MSI
   
3. **Click "Download"** - The installer is about 300MB

## Step 2: Install MongoDB

1. **Run the installer** (mongodb-windows-x86_64-X.X.X-signed.msi)

2. **Setup Type**: Choose "Complete"

3. **Service Configuration**:
   - ✅ **Check "Install MongoDB as a Service"** (IMPORTANT!)
   - Service Name: MongoDB
   - Data Directory: `C:\Program Files\MongoDB\Server\X.X\data\`
   - Log Directory: `C:\Program Files\MongoDB\Server\X.X\log\`
   - ✅ Check "Run service as Network Service user"

4. **Install MongoDB Compass**:
   - ✅ **Check "Install MongoDB Compass"** (This installs the GUI tool)

5. **Click "Install"** and wait for completion (may take 2-3 minutes)

6. **Finish Installation**

## Step 3: Verify MongoDB is Running

Open PowerShell and check if MongoDB service is running:

```powershell
# Check service status
Get-Service MongoDB

# Should show:
# Status   Name               DisplayName
# ------   ----               -----------
# Running  MongoDB            MongoDB
```

If it's not running, start it:

```powershell
# Start MongoDB service
Start-Service MongoDB

# Or restart if needed
Restart-Service MongoDB
```

## Step 4: Open MongoDB Compass

1. **Launch Compass**:
   - Search for "MongoDB Compass" in Start Menu
   - Or find it at: `C:\Program Files\MongoDB Compass\MongoDBCompass.exe`

2. **Connection Screen**:
   - You'll see a connection string field
   - **Use this connection string**:
   ```
   mongodb://localhost:27017
   ```

3. **Click "Connect"**

4. **You're In!** 🎉
   - You should see the Compass interface
   - Left sidebar shows databases
   - You may see some default databases (admin, config, local)

## Step 5: Create Your CRM Database

1. **In Compass, click "Create Database"** (green button)

2. **Fill in**:
   - Database Name: `nexus-crm`
   - Collection Name: `users`

3. **Click "Create Database"**

4. **You should now see "nexus-crm" in the left sidebar!**

## Step 6: Test Your Backend Connection

Now that MongoDB is running, start your backend:

```powershell
# In PowerShell
cd "C:\Users\Arnab Nandi\OneDrive\Desktop\CRM\BACKEND"
npm run dev
```

You should see:
```
✅ MONGODB connected !! DB HOST: localhost
🚀 Server is running at port: 8000
```

## Step 7: Register Your First User

1. **Open your browser**: http://localhost:3000

2. **Click "Get Started"** or go to Register

3. **Fill the form**:
   - Name: Your Name
   - Email: your@email.com
   - Password: strongpassword123

4. **Submit** - This will:
   - Create your user in MongoDB
   - Log you in automatically
   - Redirect to onboarding

5. **Check in Compass**:
   - Refresh the `nexus-crm` database
   - You'll see new collections: `users`, `clients`, etc.
   - Click on `users` to see your registered user!

## Viewing Your Data in Compass

### Browse Collections:
- Click on `nexus-crm` database in left sidebar
- See all collections (users, clients, communications, etc.)
- Click any collection to see documents

### View Documents:
- Click on a collection (e.g., `users`)
- See all documents in that collection
- Each document has fields like _id, fullname, email, etc.

### Search/Filter:
- Use the filter bar at top: `{ email: "your@email.com" }`
- Click "Find" to search

### Edit Documents:
- Hover over a document
- Click the pencil icon to edit
- Modify values and click "Update"

## Troubleshooting

### MongoDB Service Won't Start:
```powershell
# Check if port 27017 is already in use
netstat -ano | findstr :27017

# If something is using it, kill that process or change MongoDB port
```

### "Cannot connect to MongoDB" in backend:
1. Verify MongoDB service is running: `Get-Service MongoDB`
2. Check connection string in `.env`: `mongodb://localhost:27017/nexus-crm`
3. Try connecting with Compass first to verify MongoDB is accessible
4. Restart backend server

### MongoDB Compass won't connect:
1. Make sure MongoDB service is running
2. Use connection string: `mongodb://localhost:27017`
3. Click "Connect" (no authentication needed for local)

### Port 27017 Already in Use:
```powershell
# Find what's using the port
netstat -ano | findstr :27017

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Restart MongoDB
Restart-Service MongoDB
```

## Quick Reference

### MongoDB Service Commands:
```powershell
# Check status
Get-Service MongoDB

# Start
Start-Service MongoDB

# Stop
Stop-Service MongoDB

# Restart
Restart-Service MongoDB
```

### Connection String:
```
mongodb://localhost:27017/nexus-crm
```

### Default Port: `27017`

### Data Location:
```
C:\Program Files\MongoDB\Server\X.X\data\
```

### Compass Features:
- 📊 Visual query builder
- 📝 Document editor
- 📈 Index management
- 🔍 Schema analysis
- 📦 Import/Export data

## Next Steps

Once connected, you can:
1. ✅ Register users through your app
2. ✅ View real-time data in Compass
3. ✅ Create/edit/delete documents manually
4. ✅ Test your CRM features
5. ✅ Monitor database performance

---

**Need Help?**
- MongoDB Compass Docs: https://docs.mongodb.com/compass/
- MongoDB Windows Install: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/
