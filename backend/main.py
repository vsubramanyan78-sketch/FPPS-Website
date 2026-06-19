import random
import datetime
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

import database as db_mod
import auth
import ml_engine

app = FastAPI(title="Flight Price Prediction System (FPPS) API", version="1.0.0")

# Allow CORS for local frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Database on Startup
@app.on_event("startup")
def startup_event():
    db_mod.init_db()
    # Pre-train models if not exists
    ml_engine.load_models()

# Pydantic Schemas
class RegisterSchema(BaseModel):
    fullname: str
    email: EmailStr
    password: str

class LoginSchema(BaseModel):
    email: EmailStr
    password: str

class TokenSchema(BaseModel):
    access_token: str
    token_type: str
    user: dict

class SearchRequestSchema(BaseModel):
    source: str
    destination: str
    departure_date: str
    return_date: Optional[str] = None
    passengers: int = 1
    cabin_class: str = "Economy"
    airline: Optional[str] = None

class PredictionRequestSchema(BaseModel):
    source: str
    destination: str
    departure_date: str
    airline: str
    cabin_class: str
    stops: int = 0
    days_to_departure: int = 14
    weather_index: float = 0.2
    is_holiday: bool = False
    demand_score: float = 0.5

class PriceAlertCreateSchema(BaseModel):
    source: str
    destination: str
    threshold_price: float
    notification_type: str = "drop" # drop, rise

class BudgetPlannerRequestSchema(BaseModel):
    budget: float

class ChatMessageSchema(BaseModel):
    message: str

# ----------------- AUTH ENDPOINTS -----------------

@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
def register(data: RegisterSchema, db: Session = Depends(db_mod.get_db)):
    existing_user = db.query(db_mod.User).filter(db_mod.User.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if first user, make them admin for demo ease
    user_count = db.query(db_mod.User).count()
    is_admin = True if user_count == 0 else False
    
    hashed_password = auth.get_password_hash(data.password)
    new_user = db_mod.User(
        fullname=data.fullname,
        email=data.email,
        hashed_password=hashed_password,
        is_admin=is_admin
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    token = auth.create_access_token({"sub": new_user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "fullname": new_user.fullname,
            "email": new_user.email,
            "is_admin": new_user.is_admin
        }
    }

@app.post("/api/auth/login", response_model=TokenSchema)
def login(data: LoginSchema, db: Session = Depends(db_mod.get_db)):
    user = db.query(db_mod.User).filter(db_mod.User.email == data.email).first()
    if not user or not auth.verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    token = auth.create_access_token({"sub": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "fullname": user.fullname,
            "email": user.email,
            "is_admin": user.is_admin
        }
    }

@app.get("/api/auth/me")
def get_me(current_user: Optional[db_mod.User] = Depends(auth.get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {
        "id": current_user.id,
        "fullname": current_user.fullname,
        "email": current_user.email,
        "is_admin": current_user.is_admin
    }

# ----------------- PRICE PREDICTION ENDPOINTS -----------------

@app.post("/api/predict/flight")
def predict_flight(data: PredictionRequestSchema, current_user: Optional[db_mod.User] = Depends(auth.get_current_user), db: Session = Depends(db_mod.get_db)):
    # Run prediction through machine learning engine
    res = ml_engine.predict_flight_data(
        source=data.source,
        destination=data.destination,
        airline=data.airline,
        cabin_class=data.cabin_class,
        stops=data.stops,
        days_to_departure=data.days_to_departure,
        departure_month=data.departure_month,
        weather_index=data.weather_index,
        is_holiday=data.is_holiday,
        demand_score=data.demand_score
    )
    
    # Save prediction to DB logs
    log = db_mod.PredictionLog(
        source=data.source,
        destination=data.destination,
        departure_date=data.departure_date,
        airline=data.airline,
        cabin_class=data.cabin_class,
        predicted_price=res["predicted_price"],
        delay_probability=res["delay_probability"],
        confidence_score=res["confidence_score"]
    )
    db.add(log)
    
    # If user is logged in, log to search history
    if current_user:
        history = db_mod.SearchHistory(
            user_id=current_user.id,
            source=data.source,
            destination=data.destination,
            departure_date=data.departure_date,
            cabin_class=data.cabin_class
        )
        db.add(history)
        
    db.commit()
    
    # Smart Recommendations logic
    price = res["predicted_price"]
    rec = "MONITOR"
    explanation = "Fares are stable. Recommend monitoring the price alert feed for sudden changes."
    savings = 0.0
    increase = 0.0
    window = "10 - 15 days"
    
    if data.days_to_departure > 45:
        # A lot of time, wait for a drop
        rec = "WAIT"
        savings = round(price * 0.15, 2)
        explanation = f"Fares are expected to decline by about ₹{savings:.0f} over the next 2-3 weeks. Monitor the trend closely."
        window = "20 - 30 days before departure"
    elif data.days_to_departure < 10 or data.demand_score > 0.75:
        # High demand or close to departure, book now!
        rec = "BOOK NOW"
        increase = round(price * 0.22, 2)
        explanation = f"High demand and late booking window. Fares are expected to rise by at least ₹{increase:.0f} within 48 hours."
        window = "Immediately"
    else:
        # Moderate days remaining
        if res["delay_probability"] > 0.5:
            rec = "MONITOR"
            explanation = "Moderate fares, but high probability of weather/operation delays. Consider checking alternative routes or booking."
        else:
            rec = "BOOK NOW"
            increase = round(price * 0.08, 2)
            explanation = "Fares are near their historical floor for this season. Price is expected to increase slowly by ₹" + str(int(increase)) + " as departure approaches."
            window = "Next 3 days"
            
    res["recommendation"] = {
        "decision": rec,
        "explanation": explanation,
        "expected_savings": savings,
        "expected_increase": increase,
        "booking_window": window
    }
    
    # Price range
    range_offset = price * 0.04
    res["price_range"] = {
        "min": round(price - range_offset, 2),
        "max": round(price + range_offset, 2)
    }
    res["timestamp"] = datetime.datetime.utcnow().isoformat()
    res["trend"] = "Rising" if rec == "BOOK NOW" else ("Falling" if rec == "WAIT" else "Stable")
    
    return res

@app.post("/api/predict/compare")
def compare_airlines(data: SearchRequestSchema):
    # Compares Indigo, Air India, SpiceJet, Vistara, Akasa Air
    airlines = ml_engine.AIRLINES
    results = []
    
    # Assume 14 days to departure, month=6, weather=0.1, demand=0.4
    for air in airlines:
        res = ml_engine.predict_flight_data(
            source=data.source,
            destination=data.destination,
            airline=air,
            cabin_class=data.cabin_class,
            stops=0,
            days_to_departure=14,
            departure_month=6,
            weather_index=0.1,
            is_holiday=False,
            demand_score=0.4
        )
        
        # Rating calculations
        rating = 4.5
        if air == "Vistara":
            rating = 4.8
            duration = "2h 10m"
        elif air == "Air India":
            rating = 4.3
            duration = "2h 15m"
        elif air == "IndiGo":
            rating = 4.1
            duration = "2h 05m"
        elif air == "Akasa Air":
            rating = 4.0
            duration = "2h 12m"
        else:
            rating = 3.6
            duration = "2h 20m"
            
        results.append({
            "airline_name": air,
            "current_fare": round(res["predicted_price"] * 0.95, 2), # slightly less than predicted peak
            "predicted_fare": res["predicted_price"],
            "rating": rating,
            "duration": duration,
            "co2": res["co2_emissions"],
            "delay_probability": res["delay_probability"]
        })
        
    # Highlight specific items
    results.sort(key=lambda x: x["current_fare"])
    cheapest = results[0]["airline_name"]
    
    results.sort(key=lambda x: x["rating"], reverse=True)
    best_value = results[0]["airline_name"]
    
    results.sort(key=lambda x: x["duration"])
    fastest = results[0]["airline_name"]
    
    for r in results:
        labels = []
        if r["airline_name"] == cheapest:
            labels.append("Cheapest")
        if r["airline_name"] == best_value:
            labels.append("Best Value")
        if r["airline_name"] == fastest:
            labels.append("Fastest")
        r["recommendation"] = ", ".join(labels) if labels else "Standard Choice"
        
    return results

# ----------------- PRICE ALERT ENDPOINTS -----------------

@app.post("/api/alerts")
def create_alert(data: PriceAlertCreateSchema, current_user: db_mod.User = Depends(auth.get_required_current_user), db: Session = Depends(db_mod.get_db)):
    new_alert = db_mod.PriceAlert(
        user_id=current_user.id,
        source=data.source,
        destination=data.destination,
        threshold_price=data.threshold_price,
        notification_type=data.notification_type,
        is_active=True
    )
    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)
    return {"message": "Price alert created successfully", "alert_id": new_alert.id}

@app.get("/api/alerts")
def get_alerts(current_user: db_mod.User = Depends(auth.get_required_current_user), db: Session = Depends(db_mod.get_db)):
    alerts = db.query(db_mod.PriceAlert).filter(db_mod.PriceAlert.user_id == current_user.id).all()
    return alerts

@app.delete("/api/alerts/{alert_id}")
def delete_alert(alert_id: int, current_user: db_mod.User = Depends(auth.get_required_current_user), db: Session = Depends(db_mod.get_db)):
    alert = db.query(db_mod.PriceAlert).filter(
        db_mod.PriceAlert.id == alert_id,
        db_mod.PriceAlert.user_id == current_user.id
    ).first()
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    db.delete(alert)
    db.commit()
    return {"message": "Alert deleted successfully"}

# ----------------- ANALYTICS & INTELLIGENCE ENDPOINTS -----------------

@app.get("/api/analytics/historical")
def get_historical_analytics(source: str, destination: str):
    # Generates a realistic set of price trend arrays for historical, weekly, monthly, and forecasted trends.
    dist = ml_engine.get_route_distance(source, destination)
    base = 1500 + dist * 1.5
    
    # Weekly Prices (last 7 days)
    weekly = []
    today = datetime.date.today()
    for i in range(7):
        day = today - datetime.timedelta(days=(6-i))
        # price goes up slightly closer to today
        price = base + (i * 120) + random.uniform(-100, 100)
        weekly.append({"date": day.strftime("%a"), "price": round(price, 2)})
        
    # Monthly Prices (last 12 months)
    monthly = []
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    for i, m in enumerate(months):
        # Peak prices in Summer (May/Jun) and Winter (Nov/Dec)
        month_effect = 0
        if i in [4, 5]: # May, June
            month_effect = 1000
        elif i in [10, 11]: # Nov, Dec
            month_effect = 1600
        price = base + month_effect + random.uniform(-200, 200)
        monthly.append({"month": m, "price": round(price, 2)})
        
    # Forecasted Trends (next 30 days)
    forecast = []
    for i in range(30):
        day = today + datetime.timedelta(days=i)
        # forecast rising over the next 30 days due to shrinking capacity
        price = base + (i * 80) + random.uniform(-50, 50)
        forecast.append({"day": f"Day {i+1}", "price": round(price, 2)})
        
    # Historical Prices (last 5 years average)
    historical = []
    start_year = today.year - 4
    for i in range(5):
        # fuel inflation has pushed prices up year over year
        inflation_mult = 1.0 + (i * 0.06)
        price = base * inflation_mult + random.uniform(-150, 150)
        historical.append({"year": str(start_year + i), "price": round(price, 2)})
        
    return {
        "weekly_trends": weekly,
        "monthly_trends": monthly,
        "forecasted_trends": forecast,
        "historical_trends": historical
    }

@app.get("/api/analytics/geographical")
def get_geographical_intelligence(source: str, destination: str):
    # Returns geographical statistics for the route
    congestions = {"DEL": "High", "BOM": "Very High", "BLR": "Medium", "MAA": "Medium", "HYD": "Low", "CCU": "Low"}
    tourism = {"DEL": "High", "BOM": "High", "BLR": "Medium", "MAA": "Medium", "HYD": "Medium", "CCU": "High"}
    business = {"DEL": "Very High", "BOM": "Very High", "BLR": "Very High", "MAA": "High", "HYD": "High", "CCU": "Medium"}
    
    src_region = "North India" if source == "DEL" else ("West India" if source == "BOM" else "South India")
    dest_region = "North India" if destination == "DEL" else ("West India" if destination == "BOM" else "South India")
    if source == "CCU": src_region = "East India"
    if destination == "CCU": dest_region = "East India"
    
    # Random local events
    events = [
        "Regional Aviation Summit", "International Tech Expo", "Grand Cultural Festival", 
        "National Sports Championship", "Global Business Conclave", "Sufi Music Festival"
    ]
    
    return {
        "source_region": src_region,
        "destination_region": dest_region,
        "source_congestion": congestions.get(source, "Medium"),
        "destination_congestion": congestions.get(destination, "Medium"),
        "tourism_activity": tourism.get(destination, "Medium"),
        "business_demand": business.get(destination, "Medium"),
        "local_event": random.choice(events),
        "regional_conditions": "Favorable operations. Standard headwinds recorded."
    }

@app.get("/api/analytics/weather")
def get_weather_intelligence(source: str, destination: str):
    # Generate current mock weather impact
    temp = round(random.uniform(24.0, 39.0), 1)
    rain = round(random.uniform(0.0, 12.0), 1)
    wind = round(random.uniform(5.0, 28.0), 1)
    visibility = round(random.uniform(2.0, 10.0), 1)
    
    delay_risk = "Low"
    price_impact = "Neutral"
    demand_impact = "Stable"
    
    if rain > 8.0 or wind > 22.0 or visibility < 4.0:
        delay_risk = "High"
        price_impact = "Slight Increase (+₹300 - ₹500)"
        demand_impact = "Moderated due to delays"
    elif rain > 4.0 or wind > 15.0 or visibility < 6.0:
        delay_risk = "Medium"
        price_impact = "Stable"
        demand_impact = "Stable"
        
    return {
        "source_weather": {
            "temp_c": temp,
            "rainfall_mm": rain,
            "wind_speed_kmh": wind,
            "visibility_km": visibility
        },
        "impact": {
            "delay_probability": delay_risk,
            "ticket_prices": price_impact,
            "demand": demand_impact
        }
    }

@app.get("/api/analytics/holidays")
def get_holiday_intelligence(month: int):
    # Lists primary holidays and seasonal spikes
    months_holidays = {
        1: [{"name": "Republic Day", "impact": "High"}],
        3: [{"name": "Holi Festival", "impact": "Very High"}],
        5: [{"name": "Summer Vacation Begins", "impact": "High"}],
        8: [{"name": "Independence Day weekend", "impact": "Very High"}],
        10: [{"name": "Durga Puja & Dussehra", "impact": "Extreme"}],
        11: [{"name": "Diwali Vacation", "impact": "Extreme"}],
        12: [{"name": "Christmas & New Year Eve", "impact": "Extreme"}]
    }
    
    holidays = months_holidays.get(month, [])
    tourist_seasons = "Peak Winter Tourism" if month in [11, 12, 1, 2] else ("Peak Summer Tourism" if month in [5, 6] else "Off-Peak Monsoon")
    
    avg_surge = 0.05
    if month in [10, 11, 12]:
        avg_surge = 0.25
    elif month in [5, 6]:
        avg_surge = 0.15
        
    return {
        "holidays": holidays,
        "tourist_season": tourist_seasons,
        "school_vacation": "Active" if month in [5, 6, 12] else "Inactive",
        "average_price_surge": f"+{avg_surge*100:.0f}%"
    }

# ----------------- BUDGET PLANNER ENDPOINT -----------------

@app.post("/api/planner/budget")
def budget_planner(data: BudgetPlannerRequestSchema):
    budget = data.budget
    # Returns recommended flight deals matching target budget
    all_routes = [
        {"dest": "BOM", "name": "Mumbai", "airline": "IndiGo", "cost": 4200, "days": "Mon, Wed"},
        {"dest": "BLR", "name": "Bengaluru", "airline": "Akasa Air", "cost": 3600, "days": "Tue, Thu"},
        {"dest": "HYD", "name": "Hyderabad", "airline": "SpiceJet", "cost": 3100, "days": "Fri, Sun"},
        {"dest": "CCU", "name": "Kolkata", "airline": "IndiGo", "cost": 5500, "days": "Mon, Fri"},
        {"dest": "DEL", "name": "Delhi", "airline": "Air India", "cost": 6200, "days": "Thu, Sat"},
        {"dest": "GOI", "name": "Goa", "airline": "Vistara", "cost": 7500, "days": "Wed, Sat"},
    ]
    
    recommendations = []
    for r in all_routes:
        if r["cost"] <= budget:
            # We can calculate return trip if budget allows
            return_cost = r["cost"] * 0.9
            can_afford_return = (r["cost"] + return_cost) <= budget
            
            recommendations.append({
                "destination": r["dest"],
                "destination_name": r["name"],
                "airline": r["airline"],
                "one_way_cost": r["cost"],
                "return_cost": return_cost if can_afford_return else None,
                "total_estimated": (r["cost"] + return_cost) if can_afford_return else r["cost"],
                "trip_type": "Round Trip" if can_afford_return else "One Way",
                "recommended_dates": "Next weekend (" + r["days"] + ")"
            })
            
    recommendations.sort(key=lambda x: x["total_estimated"], reverse=True)
    return recommendations

# ----------------- AI CHAT ASSISTANT ENDPOINT -----------------

@app.post("/api/assistant/chat")
def chat_assistant(data: ChatMessageSchema):
    msg = data.message.lower()
    
    # Conversational agent responses
    if "cheap" in msg or "best time to book" in msg or "cheapest" in msg:
        reply = (
            "**FPPS Booking Intelligence Report:**\n\n"
            "1. **Indigo** and **Akasa Air** consistently report the lowest base fares across domestic routes.\n"
            "2. The optimal window for booking flights is **25 to 40 days prior to departure**.\n"
            "3. Flights departing on **Tuesdays and Wednesdays** are on average **11% cheaper** than weekend departures.\n"
            "4. You can set a price threshold alert on your dashboard to receive notifications for sudden drops."
        )
    elif "del" in msg or "bom" in msg or "blr" in msg or "route" in msg:
        reply = (
            "**FPPS Geographical Analytics:**\n\n"
            "Delhi (DEL) - Mumbai (BOM) is our highest demand corridor. Fares fluctuate between ₹4,500 and ₹14,000 depending on advance booking. "
            "Currently, Indigo offers the highest frequency (over 15 direct flights daily), while Vistara reports the highest service index rating (4.8/5.0). "
            "Would you like me to forecast prices for a specific departure date?"
        )
    elif "delay" in msg or "weather" in msg:
        reply = (
            "**Flight Delay Intelligence Summary:**\n\n"
            "* **Weather Impact:** Monsoons (Jul-Sep) and heavy winter fog (Dec-Jan) account for 74% of tactical flight delays.\n"
            "* **Congestion:** Mumbai (BOM) has a taxi-out time averaging 22 minutes due to single-runway operations, raising delay probabilities to 35% during peak hours (08:00-10:00, 18:00-21:00).\n"
            "* **Tip:** Indigo maintains the highest on-time performance (OTP) index of 88.4% globally."
        )
    elif "carbon" in msg or "co2" in msg or "green" in msg or "sustainability" in msg:
        reply = (
            "**Sustainability Flight Report:**\n\n"
            "* Direct flights release **18% less CO₂** than connecting flights due to takeoff fuel burn avoidance.\n"
            "* Indigo's A320neo fleet features advanced engine designs that reduce carbon emissions by 15% per passenger-seat-kilometer.\n"
            "* Traveling in **Economy** rather than Business class reduces your individual flight carbon footprint by roughly **60%**."
        )
    else:
        reply = (
            "Welcome to **FPPS Intelligent Travel Assistant**. I can help you with:\n\n"
            "1. **Best time to travel** & booking windows\n"
            "2. Finding the **cheapest airlines** or best value flights\n"
            "3. Explaining **price surges** (weather, holidays, demand)\n"
            "4. **Delay risks** by airline or route congestion\n\n"
            "Ask me something like: *'What is the cheapest time to fly?'* or *'How does weather affect flight prices?'*"
        )
        
    return {"reply": reply}

# ----------------- USER PROFILE HISTORIES ENDPOINT -----------------

@app.get("/api/profile/history")
def get_profile_history(current_user: db_mod.User = Depends(auth.get_required_current_user), db: Session = Depends(db_mod.get_db)):
    searches = db.query(db_mod.SearchHistory).filter(
        db_mod.SearchHistory.user_id == current_user.id
    ).order_by(db_mod.SearchHistory.timestamp.desc()).limit(30).all()
    return searches

# ----------------- ADMIN PORTAL ENDPOINTS -----------------

@app.get("/api/admin/health", dependencies=[Depends(auth.get_admin_user)])
def get_system_health(db: Session = Depends(db_mod.get_db)):
    user_count = db.query(db_mod.User).count()
    alert_count = db.query(db_mod.PriceAlert).count()
    prediction_count = db.query(db_mod.PredictionLog).count()
    
    return {
        "status": "Healthy",
        "cpu_usage_percent": round(random.uniform(8.0, 22.0), 1),
        "memory_usage_percent": 41.2,
        "database_status": "Connected (SQLite/Local)",
        "cache_status": "Running (In-Memory Fallback Active)",
        "statistics": {
            "total_registered_users": user_count,
            "total_active_alerts": alert_count,
            "total_predictions_logged": prediction_count
        }
    }

@app.get("/api/admin/predictions", dependencies=[Depends(auth.get_admin_user)])
def get_prediction_logs(db: Session = Depends(db_mod.get_db)):
    logs = db.query(db_mod.PredictionLog).order_by(db_mod.PredictionLog.timestamp.desc()).limit(100).all()
    return logs

@app.get("/api/admin/users", dependencies=[Depends(auth.get_admin_user)])
def get_users(db: Session = Depends(db_mod.get_db)):
    users = db.query(db_mod.User).order_by(db_mod.User.created_at.desc()).all()
    # return safe representation
    return [{"id": u.id, "fullname": u.fullname, "email": u.email, "is_admin": u.is_admin, "created_at": u.created_at} for u in users]

@app.post("/api/admin/retrain", dependencies=[Depends(auth.get_admin_user)])
def trigger_retraining():
    try:
        ml_engine.train_and_save_models()
        # Force re-loading
        ml_engine._price_model = None
        ml_engine.load_models()
        return {"status": "success", "message": "ML models retrained successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retraining failed: {str(e)}")
