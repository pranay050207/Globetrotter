from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from doc.routes import auth, trips, itineraries, cities, activities, budgets
from doc.routes import venues, bookings, upload, stats, saved_destinations
from doc.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="GlobeTrotter API")

# CORS configuration to allow requests from Vite dev server and typical origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers under a common '/api' prefix for cleaner client routing
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(trips.router, prefix="/api", tags=["Trips"])            # routes define '/trips'
app.include_router(itineraries.router, prefix="/api", tags=["Itineraries"]) # routes define '/itineraries'
app.include_router(cities.router, prefix="/api", tags=["Cities"])           # routes define '/cities'
app.include_router(activities.router, prefix="/api", tags=["Activities"])   # routes define '/activities'
app.include_router(budgets.router, prefix="/api", tags=["Budgets"])         # routes define '/budgets'
app.include_router(venues.router, prefix="/api", tags=["Venues"])           # routes define '/venues'
app.include_router(bookings.router, prefix="/api", tags=["Bookings"])
app.include_router(upload.router, prefix="/api", tags=["Upload"])
app.include_router(stats.router, prefix="/api", tags=["Statistics"])
app.include_router(saved_destinations.router, prefix="/api", tags=["Saved Destinations"])
