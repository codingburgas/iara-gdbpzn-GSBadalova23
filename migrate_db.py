from app import app, db
from sqlalchemy import text, inspect

def migrate():
    print("⏳ Стартиране на обновяването на базата данни...")
    with app.app_context():
        # 1. Създаване на всички липсващи таблици (напр. notification)
        db.create_all()
        print("✅ Таблиците са проверени/създадени.")

        # 2. Проверка и добавяне на колона 'likes' в таблицата 'fishing_log'
        inspector = inspect(db.engine)
        columns = [c['name'] for c in inspector.get_columns('fishing_log')]
        
        if 'likes' not in columns:
            try:
                db.session.execute(text("ALTER TABLE fishing_log ADD COLUMN likes INTEGER DEFAULT 0"))
                db.session.commit()
                print("✅ Добавена е колона 'likes' в таблицата 'fishing_log'.")
            except Exception as e:
                db.session.rollback()
                print(f"❌ Грешка при добавяне на колона 'likes': {e}")
        else:
            print("ℹ️ Колоната 'likes' вече съществува.")
            
    print("✨ Обновяването приключи успешно!")

if __name__ == '__main__':
    migrate()
