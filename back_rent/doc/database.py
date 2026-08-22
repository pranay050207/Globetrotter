from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from doc.config import settings
import os

# Get the correct database URL based on environment
if os.getenv("ENVIRONMENT", "local") == "local":
    # Use SQLite for local development if no MySQL URL is provided
    if settings.MYSQL_PUBLIC_URL:
        DATABASE_URL = settings.MYSQL_PUBLIC_URL
    else:
        DATABASE_URL = "sqlite:///./globe_trotter.db"
else:
    DATABASE_URL = settings.MYSQL_URL

# Force SQLAlchemy to use pymysql driver for MySQL
if DATABASE_URL and DATABASE_URL.startswith("mysql://"):
    DATABASE_URL = DATABASE_URL.replace("mysql://", "mysql+pymysql://", 1)

# Create engine
engine = create_engine(DATABASE_URL, pool_pre_ping=True, echo=True)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Dependency for getting DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Import models here to ensure create_all works
from doc.models import user, trip, itinerary, city, activity, budget, venue, booking

# Create tables if they don't exist
Base.metadata.create_all(bind=engine, checkfirst=True)