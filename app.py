from flask import Flask, render_template, request, redirect, url_for, flash, session
from models import db, User, Booking, FishingLog
from datetime import datetime
import uuid

app = Flask(__name__)
app.secret_key = 'iara_final_ultra_2026'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///iara_pro_v3.db'
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
        role = 'admin' if User.query.count() == 0 else 'user'
        new_user = User(username=user_name, password=pwd, role=role)
        db.session.add(new_user)
        db.session.commit()
        return redirect(url_for('login'))
    return render_template('signup.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        user = User.query.filter_by(username=request.form.get('username'),
                                    password=request.form.get('password')).first()
        if user:
            session['user_id'] = user.id
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

    all_logs = FishingLog.query.all()

    if session['role'] == 'admin':
        bookings = Booking.query.all()
        return render_template('admin_dashboard.html', bookings=bookings, logs=all_logs)

    return render_template('user_dashboard.html', all_logs=all_logs)


@app.route('/book', methods=['POST'])
def book():
    if 'user_id' not in session: return redirect(url_for('login'))

    cat = request.form.get('category')
    age = int(request.form.get('age', 0))
    exp = int(request.form.get('experience', 0))

    comp_date, region, weekend, price = None, None, None, 0.0

    if cat == 'Competition':
        comp_date = request.form.get('comp_date')
        price = 15.0 + (exp * 1.5)
        if age < 18: price = 7.5
    else:
        region = request.form.get('region')
        weekend = request.form.get('weekend')

    new_booking = Booking(
        user_id=session['user_id'],
        category=cat,
        full_name=request.form.get('full_name'),
        email=request.form.get('email'),
        age=age,
        experience_years=exp,
        competition_date=comp_date,
        price_eur=price,
        preferred_region=region,
        preferred_weekend=weekend
    )

    db.session.add(new_booking)
    db.session.commit()
    flash('Записването е успешно!', 'success')
    return redirect(url_for('dashboard'))


@app.route('/submit-log', methods=['POST'])
def submit_log():
    if 'user_id' not in session: return redirect(url_for('login'))

    fish_type = request.form.get('fish_type').strip().capitalize()
    lat_val = request.form.get('lat')
    lng_val = request.form.get('lng')

    # --- ТОЧКА 3: ЕКСПЕРТНА ПРОВЕРКА ЗА ЗАБРАНЕНИ РИБИ ---
    forbidden_fish = ["Калкан", "Есетра", "Моруна", "Бяла риба"]
    warning = None
    if fish_type in forbidden_fish:
        warning = f"ВНИМАНИЕ: Уловът на {fish_type} е забранен или подлежи на глоба през този сезон!"

    if lat_val and lng_val:
        log = FishingLog(
            user_id=session['user_id'],
            fish_type=fish_type,
            water_info=request.form.get('water_info'),
            lat=float(lat_val),
            lng=float(lng_val)
        )
        db.session.add(log)
        db.session.commit()

        if warning:
            flash(warning, 'danger')
        else:
            flash('Твоят улов беше добавен на общата карта!', 'info')
    else:
        flash('Грешка при определяне на местоположението!', 'danger')

    return redirect(url_for('dashboard'))


@app.route('/transfer-fish/<int:log_id>', methods=['POST'])
def transfer_fish(log_id):
    if 'user_id' not in session: return redirect(url_for('login'))
    log = FishingLog.query.get(log_id)
    if log and log.user_id == session['user_id']:
        log.delivery_id = str(uuid.uuid4())[:8].upper()
        log.destination = request.form.get('destination')
        log.status = "Disembarked"
        db.session.commit()
        flash(f'Рибата е разтоварена успешно! Код: {log.delivery_id}', 'success')
    return redirect(url_for('dashboard'))


# --- ТОЧКА 2: МАРШРУТ ЗА ИНСПЕКЦИИ (ГЛОБИ) ---
@app.route('/inspect/<int:log_id>', methods=['POST'])
def inspect(log_id):
    if session.get('role') != 'admin':
        flash('Нямате административни права!', 'danger')
        return redirect(url_for('dashboard'))

    log = FishingLog.query.get(log_id)
    if log:
        fine = request.form.get('fine')
        log.fine_amount = float(fine) if fine else 0.0
        log.inspection_note = request.form.get('note')
        log.is_legal = False if log.fine_amount > 0 else True
        db.session.commit()
        flash(f'Инспекцията на улов #{log.id} е отразена!', 'warning')
    return redirect(url_for('dashboard'))


if __name__ == '__main__':
    app.run(debug=True)