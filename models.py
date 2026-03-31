from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(20), default='fisher') # роля: fisher, inspector, admin

class Vessel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    registration_number = db.Column(db.String(20), unique=True) # Международен номер
    tonnage = db.Column(db.Float)
    length = db.Column(db.Float)
    engine_power = db.Column(db.Float)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'))

class FishingTicket(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    ticket_type = db.Column(db.String(20)) # child, adult, senior, disabled
    telk_number = db.Column(db.String(50), nullable=True)
    price = db.Column(db.Float)
    issue_date = db.Column(db.DateTime, default=datetime.utcnow)
    valid_until = db.Column(db.DateTime)

class FishingLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    vessel_id = db.Column(db.Integer, db.ForeignKey('vessel.id'))
    fish_type = db.Column(db.String(50))
    quantity = db.Column(db.Float)
    location = db.Column(db.String(100))
    log_date = db.Column(db.DateTime, default=datetime.utcnow)
    is_inspected = db.Column(db.Boolean, default=False)