from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), default='user')  # 'admin' или 'user'

    bookings = db.relationship('Booking', backref='fisher', lazy=True)
    logs = db.relationship('FishingLog', backref='fisher', lazy=True)

class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    category = db.Column(db.String(50))  # 'Competition' или 'Social'
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer)
    experience_years = db.Column(db.Integer)

    competition_date = db.Column(db.String(100))
    price_eur = db.Column(db.Float, default=0.0)

    preferred_region = db.Column(db.String(100))
    preferred_weekend = db.Column(db.String(100))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class FishingLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    fish_type = db.Column(db.String(50))
    water_info = db.Column(db.String(500))
    lat = db.Column(db.Float)
    lng = db.Column(db.Float)
    log_date = db.Column(db.DateTime, default=datetime.utcnow)

    status = db.Column(db.String(50), default="At Sea")
    delivery_id = db.Column(db.String(20), unique=True, nullable=True)
    destination = db.Column(db.String(100), nullable=True)

    # --- НОВО: ИНСПЕКЦИИ И ГЛОБИ ---
    fine_amount = db.Column(db.Float, default=0.0)
    inspection_note = db.Column(db.String(200), nullable=True)
    is_legal = db.Column(db.Boolean, default=True)