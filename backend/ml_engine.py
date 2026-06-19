import os
import pickle
import random
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.preprocessing import LabelEncoder

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
PRICE_MODEL_PATH = os.path.join(MODELS_DIR, "price_model.pkl")
DELAY_MODEL_PATH = os.path.join(MODELS_DIR, "delay_model.pkl")
ENCODERS_PATH = os.path.join(MODELS_DIR, "encoders.pkl")

# Airport data & distances (approximate)
AIRPORTS = {
    "DEL": "Indira Gandhi International, Delhi",
    "BOM": "Chhatrapati Shivaji Maharaj International, Mumbai",
    "BLR": "Kempegowda International, Bengaluru",
    "MAA": "Chennai International, Chennai",
    "HYD": "Rajiv Gandhi International, Hyderabad",
    "CCU": "Netaji Subhash Chandra Bose International, Kolkata"
}

DISTANCES = {
    ("DEL", "BOM"): 1150, ("BOM", "DEL"): 1150,
    ("DEL", "BLR"): 1740, ("BLR", "DEL"): 1740,
    ("DEL", "MAA"): 1760, ("MAA", "DEL"): 1760,
    ("DEL", "HYD"): 1260, ("HYD", "DEL"): 1260,
    ("DEL", "CCU"): 1310, ("CCU", "DEL"): 1310,
    ("BOM", "BLR"): 840,  ("BLR", "BOM"): 840,
    ("BOM", "MAA"): 1030, ("MAA", "BOM"): 1030,
    ("BOM", "HYD"): 620,  ("HYD", "BOM"): 620,
    ("BOM", "CCU"): 1660, ("CCU", "BOM"): 1660,
    ("BLR", "MAA"): 270,  ("MAA", "BLR"): 270,
    ("BLR", "HYD"): 500,  ("HYD", "BLR"): 500,
    ("BLR", "CCU"): 1560, ("CCU", "BLR"): 1560,
    ("MAA", "HYD"): 520,  ("HYD", "MAA"): 520,
    ("MAA", "CCU"): 1370, ("CCU", "MAA"): 1370,
    ("HYD", "CCU"): 1180, ("CCU", "HYD"): 1180,
}

AIRLINES = ["IndiGo", "Air India", "SpiceJet", "Vistara", "Akasa Air"]
CABIN_CLASSES = ["Economy", "Premium Economy", "Business", "First"]

def get_route_distance(src: str, dest: str) -> float:
    if src == dest:
        return 0.0
    return DISTANCES.get((src, dest), 1000.0)

def generate_synthetic_data(num_rows: int = 10000):
    print("Generating synthetic flight dataset...")
    data = []
    
    for _ in range(num_rows):
        src, dest = random.sample(list(AIRPORTS.keys()), 2)
        airline = random.choice(AIRLINES)
        cabin = random.choice(CABIN_CLASSES)
        stops = random.choices([0, 1, 2], weights=[0.6, 0.3, 0.1])[0]
        days_to_dep = random.randint(1, 90)
        dep_month = random.randint(1, 12)
        
        # Environmental factors
        weather_index = random.uniform(0.0, 1.0) # 0 = perfect, 1 = storm
        is_holiday = random.choices([0, 1], weights=[0.85, 0.15])[0]
        demand_score = random.uniform(0.1, 1.0)
        
        # Logic for Price
        dist = get_route_distance(src, dest)
        base_fare = 1500 + dist * 1.5
        
        # Cabin multiplier
        cabin_mult = {"Economy": 1.0, "Premium Economy": 1.4, "Business": 2.8, "First": 4.5}
        fare = base_fare * cabin_mult[cabin]
        
        # Days to departure penalty (non-linear, exponential increase when close to departure)
        dep_penalty = max(0, (90 - days_to_dep) ** 1.8) * 0.4
        fare += dep_penalty
        
        # Airline factor
        airline_offset = {"Vistara": 800, "Air India": 600, "IndiGo": -400, "SpiceJet": -600, "Akasa Air": -500}
        fare += airline_offset[airline]
        
        # Stops penalty
        fare += stops * 1200
        
        # Month effect (summer vacations and year end holiday)
        month_effect = 0
        if dep_month in [5, 6]: # Summer
            month_effect = 1200
        elif dep_month in [11, 12]: # Holiday season
            month_effect = 1800
        fare += month_effect * (1.5 if is_holiday else 1.0)
        
        # Holiday surge
        if is_holiday:
            fare += 1500
            
        # Demand surge
        fare += demand_score * 2500
        
        # Weather impact (slight price inflation due to rerouting or fuel)
        fare += weather_index * 800
        
        # Noise
        fare += random.normalvariate(0, 150)
        
        # Ensure price is realistic
        fare = max(1800.0, round(fare, 2))
        
        # Logic for Delay (target 2)
        # Delay likelihood based on stops, weather, demand, and destination
        delay_prob = 0.05 + (stops * 0.1) + (weather_index * 0.5) + (demand_score * 0.1)
        if dest in ["DEL", "BOM"]: # Highly congested airports
            delay_prob += 0.08
        is_delayed = 1 if random.random() < delay_prob else 0
        
        data.append({
            "source": src,
            "destination": dest,
            "distance": dist,
            "airline": airline,
            "cabin_class": cabin,
            "stops": stops,
            "days_to_departure": days_to_dep,
            "departure_month": dep_month,
            "weather_index": weather_index,
            "is_holiday": is_holiday,
            "demand_score": demand_score,
            "price": fare,
            "is_delayed": is_delayed
        })
        
    return pd.DataFrame(data)

def train_and_save_models():
    os.makedirs(MODELS_DIR, exist_ok=True)
    df = generate_synthetic_data()
    
    # Encode categorical features
    encoders = {}
    categorical_cols = ["source", "destination", "airline", "cabin_class"]
    
    df_encoded = df.copy()
    for col in categorical_cols:
        le = LabelEncoder()
        df_encoded[col] = le.fit_transform(df[col])
        encoders[col] = le
        
    # Save encoders
    with open(ENCODERS_PATH, "wb") as f:
        pickle.dump(encoders, f)
        
    # Define features and targets
    features = [
        "source", "destination", "distance", "airline", "cabin_class", 
        "stops", "days_to_departure", "departure_month", "weather_index", 
        "is_holiday", "demand_score"
    ]
    
    X = df_encoded[features]
    y_price = df_encoded["price"]
    y_delay = df_encoded["is_delayed"]
    
    # Train Price Regressor (Random Forest Regressor)
    print("Training price regressor...")
    price_model = RandomForestRegressor(n_estimators=30, random_state=42)
    price_model.fit(X, y_price)
    with open(PRICE_MODEL_PATH, "wb") as f:
        pickle.dump(price_model, f)
        
    # Train Delay Classifier (Random Forest Classifier)
    print("Training delay classifier...")
    delay_model = RandomForestClassifier(n_estimators=30, random_state=42)
    delay_model.fit(X, y_delay)
    with open(DELAY_MODEL_PATH, "wb") as f:
        pickle.dump(delay_model, f)
        
    print("Model training complete.")

# Global state for loaded models
_price_model = None
_delay_model = None
_encoders = None

def load_models():
    global _price_model, _delay_model, _encoders
    if _price_model is not None:
        return
        
    if not os.path.exists(PRICE_MODEL_PATH) or not os.path.exists(DELAY_MODEL_PATH) or not os.path.exists(ENCODERS_PATH):
        train_and_save_models()
        
    with open(PRICE_MODEL_PATH, "rb") as f:
        _price_model = pickle.load(f)
    with open(DELAY_MODEL_PATH, "rb") as f:
        _delay_model = pickle.load(f)
    with open(ENCODERS_PATH, "rb") as f:
        _encoders = pickle.load(f)

def predict_flight_data(
    source: str,
    destination: str,
    airline: str,
    cabin_class: str,
    stops: int,
    days_to_departure: int,
    departure_month: int,
    weather_index: float,
    is_holiday: bool,
    demand_score: float
):
    load_models()
    
    # Distance
    distance = get_route_distance(source, destination)
    
    # Encode inputs
    try:
        src_enc = _encoders["source"].transform([source])[0]
    except Exception:
        src_enc = 0
    try:
        dest_enc = _encoders["destination"].transform([destination])[0]
    except Exception:
        dest_enc = 1
    try:
        air_enc = _encoders["airline"].transform([airline])[0]
    except Exception:
        air_enc = 0
    try:
        cab_enc = _encoders["cabin_class"].transform([cabin_class])[0]
    except Exception:
        cab_enc = 0
        
    features_array = np.array([[
        src_enc, dest_enc, distance, air_enc, cab_enc,
        stops, days_to_departure, departure_month, weather_index,
        int(is_holiday), demand_score
    ]])
    
    predicted_price = float(_price_model.predict(features_array)[0])
    delay_prob = float(_delay_model.predict_proba(features_array)[0][1])
    
    # Add a confidence score (depends on days_to_departure and stops)
    # Higher days to departure and fewer stops = more confident predictions
    confidence = 0.95 - (days_to_departure / 180.0) - (stops * 0.05) - (weather_index * 0.1)
    confidence = float(np.clip(confidence, 0.65, 0.98))
    
    # Calculate Explainable AI Feature Contributions (approximate local deviations from base)
    # Base price represents the intercept or global mean
    global_mean_price = 8500.0
    
    # Calculate deviations
    airline_cont = {"Vistara": 950, "Air India": 680, "IndiGo": -350, "SpiceJet": -550, "Akasa Air": -450}.get(airline, 0.0)
    
    dist_factor = (distance - 1200) * 1.5
    cabin_factor = {"Economy": -2500, "Premium Economy": -500, "Business": 6200, "First": 15000}.get(cabin_class, 0.0)
    route_cont = dist_factor + cabin_factor + (stops * 1100)
    
    # days to dep effect
    days_cont = max(0, (90 - days_to_departure) ** 1.8) * 0.35 - 1200
    
    weather_cont = (weather_index * 700) - 200
    holiday_cont = 1600 if is_holiday else -300
    demand_cont = (demand_score * 2200) - 800
    
    # Adjust base price so sum of contributions equals predicted price
    current_sum = global_mean_price + airline_cont + route_cont + days_cont + weather_cont + holiday_cont + demand_cont
    delta = predicted_price - current_sum
    # Distribute delta proportionally
    route_cont += delta * 0.3
    days_cont += delta * 0.3
    demand_cont += delta * 0.2
    airline_cont += delta * 0.2
    
    contributions = {
        "airline": round(airline_cont, 2),
        "route": round(route_cont, 2),
        "seasonal": round(days_cont, 2),
        "demand": round(demand_cont, 2),
        "weather": round(weather_cont, 2),
        "holiday": round(holiday_cont, 2)
    }
    
    # CO2 emission calculation (115g per passenger-km for short-haul, slightly less for long haul)
    co2_emissions = round((distance * 0.115) * (1.2 if cabin_class in ["Business", "First"] else 1.0), 1)
    
    return {
        "predicted_price": round(predicted_price, 2),
        "delay_probability": round(delay_prob, 4),
        "confidence_score": round(confidence, 4),
        "co2_emissions": co2_emissions,
        "contributions": contributions
    }
