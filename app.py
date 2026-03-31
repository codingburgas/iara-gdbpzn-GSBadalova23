from flask import Flask, render_template, request, redirect, url_for, flash
from models import db, User, Vessel, FishingTicket, FishingLog
from datetime import datetime, timedelta

app = Flask(__name__)
app.secret_key = 'iara_secret_key_2026'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///iara_system.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        user = request.form.get('username')
        pwd = request.form.get('password')
        if User.query.filter_by(username=user).first():
            flash('Потребителското име е заето!', 'danger')
        else:
            new_user = User(username=user, password=pwd)
            db.session.add(new_user)
            db.session.commit()
            return redirect(url_for('login'))
    return render_template('signup.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        user = User.query.filter_by(username=request.form.get('username')).first()
        if user and user.password == request.form.get('password'):
            return redirect(url_for('dashboard'))
        flash('Грешно име или парола!', 'danger')
    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
    vessels = Vessel.query.all()
    tickets = FishingTicket.query.all()
    logs = FishingLog.query.all()
    return render_template('dashboard.html', vessels=vessels, tickets=tickets, logs=logs)

@app.route('/buy-ticket', methods=['POST'])
def buy_ticket():
    u_type = request.form.get('type')
    period = int(request.form.get('period'))
    telk = request.form.get('telk')

    base_price = 40.0
    if u_type == 'disabled':
        price = 0.0
    elif u_type in ['child', 'senior']:
        price = base_price * 0.5
    else:
        price = base_price

    new_ticket = FishingTicket(
        user_id=1,
        ticket_type=u_type,
        telk_number=telk,
        price=price,
        valid_until=datetime.utcnow() + timedelta(days=period)
    )
    db.session.add(new_ticket)
    db.session.commit()
    flash(f'Билетът е закупен за {price} лв.', 'success')
    return redirect(url_for('dashboard'))

@app.route('/submit-log', methods=['POST'])
def submit_log():
    log = FishingLog(
        vessel_id=request.form.get('vessel_id'),
        fish_type=request.form.get('fish_type'),
        quantity=float(request.form.get('qty')),
        location=request.form.get('coords')
    )
    db.session.add(log)
    db.session.commit()
    flash('Уловът е записан в електронния дневник.', 'info')
    return redirect(url_for('dashboard'))

@app.route('/inspect/<int:log_id>')
def inspect(log_id):
    log = FishingLog.query.get(log_id)
    if log:
        log.is_inspected = True
        db.session.commit()
        flash(f'Инспекция на запис #{log_id} завършена!', 'success')
    return redirect(url_for('dashboard'))

if __name__ == '__main__':
    app.run(debug=True)