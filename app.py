from flask import Flask, render_template, request, redirect, url_for, flash, session
from models import db, User, Appointment, FishingLog
from datetime import datetime, timedelta

app = Flask(__name__)
app.secret_key = 'iara_pro_system_2026'

# Свързване с новата база данни
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///iara_pro.db'
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
        user_name = request.form.get('username')
        pwd = request.form.get('password')

        if User.query.filter_by(username=user_name).first():
            flash('Потребителското име е заето!', 'danger')
        else:
            # Първият регистриран потребител автоматично става Admin за тестови цели
            role = 'admin' if User.query.count() == 0 else 'user'
            new_user = User(username=user_name, password=pwd, role=role)
            db.session.add(new_user)
            db.session.commit()
            flash(f'Успешна регистрация като {role}!', 'success')
            return redirect(url_for('login'))
    return render_template('signup.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        user_name = request.form.get('username')
        pwd = request.form.get('password')
        user = User.query.filter_by(username=user_name, password=pwd).first()

        if user:
            session['user_id'] = user.id
            session['username'] = user.username
            session['role'] = user.role
            return redirect(url_for('dashboard'))

        flash('Грешно име или парола!', 'danger')
    return render_template('login.html')


@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))


@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))

    if session['role'] == 'admin':
        # Админът вижда всички записи в календара и всички улови
        appointments = Appointment.query.order_by(Appointment.app_date, Appointment.app_time).all()
        logs = FishingLog.query.all()
        return render_template('admin_dashboard.html', appointments=appointments, logs=logs)
    else:
        # Потребителят вижда само своите данни
        my_logs = FishingLog.query.filter_by(user_id=session['user_id']).all()
        return render_template('user_dashboard.html', logs=my_logs)


@app.route('/book-appointment', methods=['POST'])
def book_appointment():
    if 'user_id' not in session:
        return redirect(url_for('login'))

    # Цени в ЕВРО (€)
    prices = {"Annual": 25.0, "Monthly": 10.0, "Weekly": 5.0}
    t_type = request.form.get('ticket_type')

    # Преобразуване на дата и час от формата
    date_str = request.form.get('date')
    time_str = request.form.get('time')

    new_app = Appointment(
        user_id=session['user_id'],
        full_name=request.form.get('full_name'),
        app_date=datetime.strptime(date_str, '%Y-%m-%d').date(),
        app_time=datetime.strptime(time_str, '%H:%M').time(),
        ticket_type=t_type,
        price_eur=prices.get(t_type, 0)
    )
    db.session.add(new_app)
    db.session.commit()
    flash(f'Часът е запазен! Сума за плащане: {new_app.price_eur} €', 'success')
    return redirect(url_for('dashboard'))


@app.route('/submit-log', methods=['POST'])
def submit_log():
    if 'user_id' not in session:
        return redirect(url_for('login'))

    log = FishingLog(
        user_id=session['user_id'],
        fish_type=request.form.get('fish_type'),
        quantity=float(request.form.get('qty')),
        water_body_type=request.form.get('water_body'),  # Река, Море, Блато и т.н.
        location_name=request.form.get('location_name'),
        lat=float(request.form.get('lat')),
        lng=float(request.form.get('lng'))
    )
    db.session.add(log)
    db.session.commit()
    flash('Уловът е изпратен за валидация!', 'info')
    return redirect(url_for('dashboard'))


@app.route('/validate-log/<int:log_id>')
def validate_log(log_id):
    if session.get('role') != 'admin':
        return "Достъп отказан", 403

    log = FishingLog.query.get(log_id)
    if log:
        log.is_validated = True
        db.session.commit()
        flash(f'Улов #{log_id} беше валидиран!', 'success')
    return redirect(url_for('dashboard'))


if __name__ == '__main__':
    app.run(debug=True)