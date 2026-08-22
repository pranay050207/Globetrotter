# Saved Destinations Feature

## Overview
The Saved Destinations feature allows users to save their favorite cities and destinations for later reference. This feature connects the CitySearch component with the UserProfile component, providing a seamless way to discover, save, and manage travel destinations.

## Features

### 1. Save Destinations from City Search
- Users can save any city from the CitySearch page
- Each city card now has a "Save Destination" button
- Visual feedback shows when a destination is being saved
- Prevents duplicate saves for the same city

### 2. Dynamic Saved Destinations in Profile
- Saved destinations are displayed in the UserProfile component
- Real-time updates when destinations are added/removed
- Rich information display including ratings, popularity, and highlights
- Delete functionality for individual destinations

### 3. Database Integration
- New `saved_destinations` table in the database
- Full CRUD operations via REST API
- User-specific destination storage
- JSON storage for highlights arrays

## Technical Implementation

### Backend (FastAPI)

#### Database Model
```python
# back_rent/doc/models/saved_destination.py
class SavedDestination(Base):
    __tablename__ = "saved_destinations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    city_name = Column(String(255), nullable=False)
    country_name = Column(String(255), nullable=False)
    region = Column(String(255), nullable=True)
    image_url = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    rating = Column(Integer, nullable=True)
    popularity = Column(Integer, nullable=True)
    cost_index = Column(Integer, nullable=True)
    daily_budget = Column(String(100), nullable=True)
    temperature = Column(String(50), nullable=True)
    best_time = Column(String(100), nullable=True)
    highlights = Column(Text, nullable=True)  # JSON string
    saved_at = Column(DateTime(timezone=True), server_default=func.now())
```

#### API Endpoints
- `POST /api/saved-destinations/` - Save a new destination
- `GET /api/saved-destinations/` - Get user's saved destinations
- `GET /api/saved-destinations/{id}` - Get specific destination
- `PUT /api/saved-destinations/{id}` - Update destination
- `DELETE /api/saved-destinations/{id}` - Delete destination
- `DELETE /api/saved-destinations/` - Clear all destinations

### Frontend (React/TypeScript)

#### API Functions
```typescript
// src/utils/api.ts
export async function getSavedDestinations(): Promise<SavedDestination[]>
export async function createSavedDestination(destination: SavedDestinationCreate): Promise<SavedDestination>
export async function updateSavedDestination(id: number, destination: Partial<SavedDestinationCreate>): Promise<SavedDestination>
export async function deleteSavedDestination(id: number): Promise<void>
export async function clearAllSavedDestinations(): Promise<void>
```

#### Components Updated
1. **CitySearch.tsx**
   - Added save destination button to each city card
   - Visual feedback for save state
   - Prevents duplicate saves

2. **UserProfile.tsx**
   - Dynamic saved destinations display
   - Delete functionality
   - Rich destination information
   - Empty state handling

## Usage

### For Users
1. Navigate to City Search page
2. Browse available cities
3. Click "Save Destination" on any city you like
4. View saved destinations in your Profile > Saved Destinations
5. Remove destinations you no longer want

### For Developers
1. Start the backend server: `uvicorn doc.main:app --reload`
2. The new endpoints will be available at `/api/saved-destinations/`
3. Test with the provided test script: `python test_saved_destinations.py`

## Database Migration
The new `saved_destinations` table will be automatically created when you start the FastAPI server, as it uses SQLAlchemy's `Base.metadata.create_all()`.

## Future Enhancements
- Bulk operations (save multiple destinations at once)
- Destination categories/tags
- Sharing saved destinations with other users
- Export saved destinations to various formats
- Integration with trip planning (add saved destinations directly to trips)

## Testing
Run the test script to verify the API endpoints:
```bash
cd back_rent
python test_saved_destinations.py
```

The script will test basic connectivity and authentication requirements.
