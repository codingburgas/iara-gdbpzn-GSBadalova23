import os
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from models import db, User, Booking, FishingLog, FishingVessel, CommercialPermit, PollutionReport
from sqlalchemy import func
from datetime import datetime
from werkzeug.utils import secure_filename
import uuid

app = Flask(__name__)
app.secret_key = 'iara_final_ultra_2026'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///iara_pro_v3.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Конфигурация за качване на снимки
UPLOAD_FOLDER = 'static/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

db.init_app(app)

with app.app_context():
    db.create_all()

FISH_RULES = {
    "Есетра": "Критично застрашен вид! Уловът е абсолютно забранен (р. Дунав и Черно море).",
    "Моруна": "Забранен за улов вид! Веднага върнете рибата във водата.",
    "Чига": "Защитен вид в р. Дунав. Уловът е забранен!",
    "Калкан": "Квотен режим. Забрана: 15 април - 15 юни. Мин. размер: 45 см.",
    "Карагьоз": "Пролетна забрана (обикновено май). Минимален размер: 22 см.",
    "Паламуд": "Минимален разрешен размер: 28 см.",
    "Сафрид": "Минимален разрешен размер: 12 см.",
    "Чернокоп": "Минимален разрешен размер: 18 см.",
    "Шаран": "Забрана за размножаване: 15 април - 31 май. Мин. размер: 30 см.",
    "Бяла риба": "Забрана: 15 март - 15 май. Минимален размер: 45 см.",
    "Щука": "Забрана: 1 февруари - 30 април. Минимален размер: 35 см.",
    "Сом": "Забрана: май - юни. Минимален разрешен размер: 65 см.",
    "Распер": "Забрана: 1 март - 30 април. Минимален размер: 40 см.",
    "Пъстърва": "Балканска пъстърва: Забрана 1 окт - 31 ян. Мин. размер: 23 см.",
    "Амур": "Бял амур - минимален размер: 40 см.",
    "Скобар": "Минимален размер: 20 см."
}


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        user_name = request.form.get('username').strip()
        pwd = request.form.get('password')
        existing_user = User.query.filter_by(username=user_name).first()
        if existing_user:
            flash(f'Името "{user_name}" вече е заето!', 'danger')
            return redirect(url_for('signup'))
        role = 'admin' if User.query.count() == 0 else 'user'
        new_user = User(username=user_name, password=pwd, role=role)
        db.session.add(new_user)
        db.session.commit()
        flash('Регистрацията е успешна!', 'success')
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
    if 'user_id' not in session: return redirect(url_for('login'))
    user_id = session['user_id']
    all_logs = FishingLog.query.all()
    bookings = Booking.query.all()
    pollution_reports = PollutionReport.query.order_by(PollutionReport.report_date.desc()).all()

    for b in bookings:
        if b.category == 'Competition':
            date_str = str(b.competition_date)
            if "✅" in date_str or "Март" in date_str or "Май" in date_str or "Юни" in date_str:
                b.is_finished = True
            else:
                b.is_finished = False

    # --- ЛИЧНА СТАТИСТИКА ЗА ПОТРЕБИТЕЛЯ ---
    personal_stats = db.session.query(
        FishingLog.fish_type, func.count(FishingLog.id)
    ).filter_by(user_id=user_id).group_by(FishingLog.fish_type).all()

    top_spots = db.session.query(
        FishingLog.water_info, func.count(FishingLog.id)
    ).filter_by(user_id=user_id).group_by(FishingLog.water_info).order_by(func.count(FishingLog.id).desc()).limit(
        3).all()

    if session['role'] == 'admin':
        vessels = FishingVessel.query.all()
        users = User.query.filter_by(role='user').all()
        permits = CommercialPermit.query.all()
        return render_template('admin_dashboard.html', bookings=bookings, logs=all_logs, vessels=vessels, users=users,
                               permits=permits, pollution_reports=pollution_reports)

    my_vessels = FishingVessel.query.filter_by(owner_id=user_id).all()
    return render_template('user_dashboard.html', all_logs=all_logs, my_vessels=my_vessels, stats=personal_stats,
                           spots=top_spots)


@app.route('/api/report-pollution', methods=['POST'])
def api_report_pollution():
    if 'user_id' not in session: return jsonify({"error": "Unauthorized"}), 401
    data = request.json
    try:
        new_report = PollutionReport(
            user_id=session['user_id'],
            description=data.get('description'),
            lat=data.get('lat'),
            lng=data.get('lng')
        )
        db.session.add(new_report)
        db.session.commit()
        return jsonify({"status": "success"}), 200
    except:
        return jsonify({"status": "error"}), 500


@app.route('/admin/resolve-report/<int:report_id>', methods=['POST'])
def resolve_report(report_id):
    if session.get('role') != 'admin': return redirect(url_for('dashboard'))
    report = PollutionReport.query.get(report_id)
    if report:
        report.status = 'Resolved'
        db.session.commit()
        flash('Сигналът е маркиран като проверен!', 'success')
    return redirect(url_for('dashboard'))


@app.route('/admin/add-vessel', methods=['POST'])
def add_vessel():
    if session.get('role') != 'admin': return redirect(url_for('dashboard'))
    try:
        new_vessel = FishingVessel(
            vessel_name=request.form.get('vessel_name'),
            external_marking=request.form.get('marking'),
            cfr_number=request.form.get('cfr'),
            ircs_call_sign=request.form.get('call_sign'),
            length_overall=float(request.form.get('length', 0)),
            gross_tonnage=float(request.form.get('tonnage', 0)),
            engine_power=float(request.form.get('power', 0)),
            owner_id=request.form.get('owner_id')
        )
        db.session.add(new_vessel)
        db.session.commit()
        flash('Корабът е успешно вписан!', 'success')
    except:
        db.session.rollback()
        flash('Грешка при регистрация на кораб!', 'danger')
    return redirect(url_for('dashboard'))


@app.route('/admin/issue-permit', methods=['POST'])
def issue_permit():
    if session.get('role') != 'admin': return redirect(url_for('dashboard'))
    try:
        valid_date = datetime.strptime(request.form.get('valid_until'), '%Y-%m-%d')
        new_permit = CommercialPermit(
            permit_number=f"PERM-{uuid.uuid4().hex[:6].upper()}",
            vessel_id=request.form.get('vessel_id'),
            allowed_gear=request.form.get('gear'),
            valid_until=valid_date
        )
        db.session.add(new_permit)
        db.session.commit()
        flash('Успешно издадено разрешително!', 'success')
    except:
        db.session.rollback()
        flash('Грешка при издаване на разрешително!', 'danger')
    return redirect(url_for('dashboard'))


@app.route('/book', methods=['POST'])
def book():
    if 'user_id' not in session: return redirect(url_for('login'))
    cat = request.form.get('category')
    age = int(request.form.get('age', 0))
    exp = int(request.form.get('experience', 0))
    telk = request.form.get('telk_number', '').strip()

    if telk:
        price = 0.0
        flash(f'Издаден безплатен билет (ТЕЛК №{telk})', 'success')
    elif age < 18:
        price = 0.0
        flash('Издаден безплатен билет за непълнолетен', 'info')
    elif age >= 65:
        price = 5.0
        flash('Приложено фиксирано намаление за пенсионер (5.00 €)', 'info')
    else:
        price = 10.0
        if cat == 'Competition':
            price += 5.0 + (exp * 0.5)

    if cat == 'Competition':
        comp_date = request.form.get('comp_date')
        region, weekend = None, None
    else:
        comp_date = None
        region, weekend = request.form.get('region'), request.form.get('weekend')

    new_booking = Booking(
        user_id=session['user_id'], category=cat, full_name=request.form.get('full_name'),
        email=request.form.get('email'), age=age, experience_years=exp,
        telk_number=telk if telk else None,
        competition_date=comp_date, price_eur=price, preferred_region=region, preferred_weekend=weekend
    )
    db.session.add(new_booking)
    db.session.commit()
    flash(f'Записването е успешно! Крайна цена: {price} €', 'success')
    return redirect(url_for('dashboard'))


@app.route('/submit-log', methods=['POST'])
def submit_log():
    if 'user_id' not in session: return redirect(url_for('login'))

    # 1. Обработка на снимката (НОВО)
    file = request.files.get('fish_photo')
    filename = None
    if file and file.filename != '':
        filename = secure_filename(f"{uuid.uuid4().hex}_{file.filename}")
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

    fish_type = request.form.get('fish_type', '').strip().capitalize()
    lat, lng = request.form.get('lat'), request.form.get('lng')
    v_id = request.form.get('vessel_id')

    start_str, end_str, gear = request.form.get('start_time'), request.form.get('end_time'), request.form.get(
        'gear_used')
    start_dt = datetime.strptime(start_str, '%Y-%m-%dT%H:%M') if start_str else None
    end_dt = datetime.strptime(end_str, '%Y-%m-%dT%H:%M') if end_str else None

    if not lat or not lng:
        flash('Моля, изберете точка на картата!', 'danger')
        return redirect(url_for('dashboard'))

    log = FishingLog(
        user_id=session['user_id'], vessel_id=int(v_id) if v_id else None,
        fish_type=fish_type, water_info=request.form.get('water_info'),
        lat=float(lat), lng=float(lng), start_time=start_dt, end_time=end_dt, gear_used=gear,
        fish_image_url=filename, tackle_info=request.form.get('tackle_info'),
        is_public=True if request.form.get('is_public') == 'on' else False
    )
    db.session.add(log)
    db.session.commit()

    warning = FISH_RULES.get(fish_type)
    if warning:
        flash(f"👮 ИАРА Сигнал: {warning}", 'danger')
    else:
        flash('Дневникът е обновен успешно!', 'info')
    return redirect(url_for('dashboard'))


@app.route('/transfer-fish/<int:log_id>', methods=['POST'])
def transfer_fish(log_id):
    if 'user_id' not in session: return redirect(url_for('login'))
    log = FishingLog.query.get(log_id)
    if log and log.user_id == session['user_id']:
        log.delivery_id, log.destination, log.status = str(uuid.uuid4())[:8].upper(), request.form.get(
            'destination'), "Disembarked"
        db.session.commit()
        flash(f'Рибата е предадена! Код: {log.delivery_id}', 'success')
    return redirect(url_for('dashboard'))


@app.route('/inspect/<int:log_id>', methods=['POST'])
def inspect(log_id):
    if session.get('role') != 'admin': return redirect(url_for('dashboard'))
    log = FishingLog.query.get(log_id)
    if log:
        if request.form.get('status') == 'ok':
            log.fine_amount, log.inspection_note, log.is_legal = 0.0, "Изряден улов", True
        else:
            try:
                log.fine_amount = float(request.form.get('fine') or 0)
                log.inspection_note = request.form.get('note') or "Нарушение"
                log.is_legal = False if log.fine_amount > 0 else True
            except:
                flash('Грешна сума!', 'danger')
        db.session.commit()
    return redirect(url_for('dashboard'))


if __name__ == '__main__':
    app.run(debug=True)