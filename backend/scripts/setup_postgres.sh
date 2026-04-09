#!/usr/bin/env bash
# =============================================================
# إعداد PostgreSQL للمشروع — شغّله مرة واحدة فقط
# استخدام: bash scripts/setup_postgres.sh
# =============================================================
set -e

echo "=== 1. تثبيت PostgreSQL ==="
# نتجاهل خطأ مستودع Cursor (GPG) ونكمل التثبيت
sudo apt-get update --allow-unauthenticated 2>/dev/null || true
sudo apt-get install -y postgresql postgresql-contrib

echo ""
echo "=== 2. تشغيل PostgreSQL ==="
sudo systemctl enable postgresql
sudo systemctl start postgresql

echo ""
echo "=== 3. إنشاء المستخدم والقاعدة ==="
sudo -u postgres psql <<'SQL'
DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'quiz_user') THEN
      CREATE USER quiz_user WITH PASSWORD 'quiz_pass';
   END IF;
END$$;

SELECT 'quiz_db exists' WHERE EXISTS (SELECT FROM pg_database WHERE datname = 'quiz_db')
UNION ALL
SELECT 'quiz_db created' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'quiz_db');
SQL

sudo -u postgres psql -c "SELECT 1 FROM pg_database WHERE datname='quiz_db';" | grep -q 1 || \
    sudo -u postgres psql -c "CREATE DATABASE quiz_db OWNER quiz_user;"

sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE quiz_db TO quiz_user;"

echo ""
echo "=== 4. اختبار الاتصال ==="
PGPASSWORD=quiz_pass psql -U quiz_user -h localhost -d quiz_db -c "SELECT 'Connection OK';" && \
    echo "" && echo "✓ PostgreSQL جاهز!" && \
    echo "  DATABASE_URL=postgresql://quiz_user:quiz_pass@localhost:5432/quiz_db"
