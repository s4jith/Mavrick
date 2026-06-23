import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URI = os.getenv("MONGO_URI")

client = AsyncIOMotorClient(MONGO_URI)
database = client.mavrick_db

# Collections
users_collection = database.get_collection("users")
plans_collection = database.get_collection("plans")

# Create unique index for user emails
async def init_db():
    await users_collection.create_index("email", unique=True)
