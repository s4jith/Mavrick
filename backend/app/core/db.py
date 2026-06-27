from motor.motor_asyncio import AsyncIOMotorClient
from ..config import settings  # ensures .env is loaded before we read MONGO_URI

MONGO_URI = settings.mongo_uri

client = AsyncIOMotorClient(MONGO_URI)
database = client.mavrick_db

# Collections
users_collection = database.get_collection("users")
plans_collection = database.get_collection("plans")

# Create unique index for user emails
async def init_db():
    await users_collection.create_index("email", unique=True)
