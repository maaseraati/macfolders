-- Схема базы данных демо-бота салона красоты.
-- Используется SQLite (aiosqlite).

CREATE TABLE IF NOT EXISTS services (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL,
    price       INTEGER NOT NULL,           -- в рублях
    duration    INTEGER NOT NULL DEFAULT 60, -- в минутах
    is_active   INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS masters (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    role        TEXT    NOT NULL DEFAULT 'Мастер',
    is_active   INTEGER NOT NULL DEFAULT 1
);

-- Какие услуги выполняет какой мастер
CREATE TABLE IF NOT EXISTS master_services (
    master_id   INTEGER NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
    service_id  INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    PRIMARY KEY (master_id, service_id)
);

-- Рабочие слоты (генерируются автоматически из расписания)
-- date в формате YYYY-MM-DD, time в формате HH:MM
CREATE TABLE IF NOT EXISTS slots (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    master_id   INTEGER NOT NULL REFERENCES masters(id) ON DELETE CASCADE,
    date        TEXT    NOT NULL,
    time        TEXT    NOT NULL,
    is_open     INTEGER NOT NULL DEFAULT 1,
    UNIQUE (master_id, date, time)
);

CREATE INDEX IF NOT EXISTS idx_slots_master_date ON slots(master_id, date);

-- Записи клиентов
CREATE TABLE IF NOT EXISTS bookings (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      INTEGER NOT NULL,            -- telegram user id
    user_name    TEXT    NOT NULL,
    user_phone   TEXT    NOT NULL,
    service_id   INTEGER NOT NULL REFERENCES services(id),
    master_id    INTEGER NOT NULL REFERENCES masters(id),
    date         TEXT    NOT NULL,
    time         TEXT    NOT NULL,
    status       TEXT    NOT NULL DEFAULT 'new',  -- new | confirmed | cancelled
    created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
