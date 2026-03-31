from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    # Роля: 'admin' за служители на ИАРА, 'user' за обикновени рибари
    role = db.Column(db.String(20), default='user')

    # Връзки
    appointments = db.relationship('Appointment', backref='fisherman', lazy=True)
    logs = db.relationship('FishingLog', backref='fisherman', lazy=True)


class Appointment(db.Model):
    """ Модел за календара - записване на часове за билети/консултации """
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    # Дата и час, избрани от потребителя чрез календара
    app_date = db.Column(db.Date, nullable=False)
    app_time = db.Column(db.Time, nullable=False)
    ticket_type = db.Column(db.String(50))  # 'Annual', 'Monthly', 'Weekly'
    price_eur = db.Column(db.Float)  # Вече в ЕВРО (€)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class FishingLog(db.Model):
    """ Модел за улова с информация за водоема """
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    fish_type = db.Column(db.String(50))
    quantity = db.Column(db.Float)

    # Информация за мястото (ще се попълва автоматично при клик на картата)
    water_body_type = db.Column(db.String(50))  # 'River', 'Sea', 'Lake', 'Marsh'
    location_name = db.Column(db.String(200))
    lat = db.Column(db.Float)  # Географска ширина
    lng = db.Column(db.Float)  # Географска дължина

    log_date = db.Column(db.DateTime, default=datetime.utcnow)
    is_validated = db.Column(db.Boolean, default=False)  # Валидация от Админ