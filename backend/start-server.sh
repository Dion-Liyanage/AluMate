#!/bin/bash
cd /home/dion/dev/fyp/AluMate/backend
export MONGODB_URI="mongodb+srv://dionishera2001_db_user:C4AktOk7spyv5K2D@cluster0.ech2ar9.mongodb.net/alumate_db?retryWrites=true&w=majority&appName=Cluster0"
export JWT_SECRET="alumate_jwt_super_secret_key_2026"
export JWT_EXPIRATION="7d"
export PORT="4000"
export FRONTEND_URL="http://localhost:3000"

# Using ts-node directly to avoid Nest CLI UNC path issues
npx ts-node -r tsconfig-paths/register src/main.ts
