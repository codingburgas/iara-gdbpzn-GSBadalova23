from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), default='user')

    bookings = db.relationship('Booking', backref='fisher', lazy=True)
    logs = db.relationship('FishingLog', backref='fisher', lazy=True)
    vessels = db.relationship('FishingVessel', backref='owner', lazy=True)


class FishingVessel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    vessel_name = db.Column(db.String(100), nullable=False)
    external_marking = db.Column(db.String(50), unique=True, nullable=False)
    cfr_number = db.Column(db.String(50), unique=True, nullable=False)
    ircs_call_sign = db.Column(db.String(50))
    length_overall = db.Column(db.Float)
    gross_tonnage = db.Column(db.Float)
    engine_power = db.Column(db.Float)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    is_active = db.Column(db.Boolean, default=True)

    permits = db.relationship('CommercialPermit', backref='vessel', lazy=True)
    vessel_logs = db.relationship('FishingLog', backref='vessel', lazy=True)


class CommercialPermit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    permit_number = db.Column(db.String(50), unique=True, nullable=False)
    vessel_id = db.Column(db.Integer, db.ForeignKey('fishing_vessel.id'), nullable=False)
    allowed_gear = db.Column(db.String(200), nullable=False)
    valid_until = db.Column(db.DateTime, nullable=False)
    issued_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_valid = db.Column(db.Boolean, default=True)


class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    category = db.Column(db.String(50))
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer)
    experience_years = db.Column(db.Integer)

    # --- НОВО ПО ТОЧКА 4: ТЕЛК ---
    telk_number = db.Column(db.String(50), nullable=True)
    # ----------------------------

    competition_date = db.Column(db.String(100))
    price_eur = db.Column(db.Float, default=0.0)
    preferred_region = db.Column(db.String(100))
    preferred_weekend = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class FishingLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    vessel_id = db.Column(db.Integer, db.ForeignKey('fishing_vessel.id'), nullable=True)
    fish_type = db.Column(db.String(50))
    water_info = db.Column(db.String(500))
    lat = db.Column(db.Float)
    lng = db.Column(db.Float)

    # ПО ТОЧКА 3: ERS
    start_time = db.Column(db.DateTime, nullable=True)
    end_time = db.Column(db.DateTime, nullable=True)
    gear_used = db.Column(db.String(100), nullable=True)

    log_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), default="At Sea")
    delivery_id = db.Column(db.String(20), unique=True, nullable=True)
    destination = db.Column(db.String(100), nullable=True)
    fine_amount = db.Column(db.Float, default=0.0)
    inspection_note = db.Column(db.String(200), nullable=True)
    is_legal = db.Column(db.Boolean, default=True)