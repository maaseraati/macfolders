"""Тонкий слой над aiosqlite: соединение, инициализация схемы, seed демо-данных."""
from __future__ import annotations

import datetime as dt
from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncIterator

import aiosqlite

from bot.config import DB_PATH, SALON

SCHEMA_PATH = Path(__file__).resolve().parent.parent / "schema.sql"


@asynccontextmanager
async def get_conn() -> AsyncIterator[aiosqlite.Connection]:
    conn = await aiosqlite.connect(DB_PATH)
    conn.row_factory = aiosqlite.Row
    await conn.execute("PRAGMA foreign_keys = ON;")
    try:
        yield conn
    finally:
        await conn.close()


async def init_db() -> None:
    """Создаёт таблицы и наполняет демо-данными при первом запуске."""
    schema = SCHEMA_PATH.read_text(encoding="utf-8")
    async with get_conn() as conn:
        await conn.executescript(schema)
        await conn.commit()

        async with conn.execute("SELECT COUNT(*) FROM services") as cur:
            (count,) = await cur.fetchone()
        if count == 0:
            await _seed_demo(conn)
            await conn.commit()

        # Слоты пересоздаём на ближайшие N дней (без затирания существующих записей).
        await _ensure_slots(conn, days=SALON.days_ahead)
        await conn.commit()


async def _seed_demo(conn: aiosqlite.Connection) -> None:
    services = [
        ("Маникюр классический", 1500, 60),
        ("Маникюр + покрытие гель-лак", 2500, 90),
        ("Оформление и окрашивание бровей", 1200, 45),
        ("Женская стрижка + укладка", 2000, 60),
    ]
    await conn.executemany(
        "INSERT INTO services (title, price, duration) VALUES (?, ?, ?)",
        services,
    )

    masters = [
        ("Анна", "Топ-мастер маникюра"),
        ("Мария", "Бровист, визажист"),
        ("Ольга", "Парикмахер-стилист"),
    ]
    await conn.executemany(
        "INSERT INTO masters (name, role) VALUES (?, ?)",
        masters,
    )

    # master_id: 1 Анна → услуги 1,2; 2 Мария → 3; 3 Ольга → 4
    await conn.executemany(
        "INSERT INTO master_services (master_id, service_id) VALUES (?, ?)",
        [(1, 1), (1, 2), (2, 3), (3, 4)],
    )


async def _ensure_slots(conn: aiosqlite.Connection, *, days: int) -> None:
    """Генерирует рабочие слоты на ближайшие N дней для всех активных мастеров."""
    async with conn.execute("SELECT id FROM masters WHERE is_active = 1") as cur:
        master_ids = [row[0] for row in await cur.fetchall()]
    if not master_ids:
        return

    today = dt.date.today()
    rows: list[tuple[int, str, str]] = []
    for offset in range(days):
        day = today + dt.timedelta(days=offset)
        # Воскресенье — сокращённый день (с 11 до 18)
        if day.weekday() == 6:
            start, end = 11, 18
        else:
            start, end = SALON.work_start_hour, SALON.work_end_hour
        for hour in range(start, end):
            time_str = f"{hour:02d}:00"
            for mid in master_ids:
                rows.append((mid, day.isoformat(), time_str))

    await conn.executemany(
        "INSERT OR IGNORE INTO slots (master_id, date, time) VALUES (?, ?, ?)",
        rows,
    )


# ───── Утилиты ─────

def fmt_price(value: int) -> str:
    return f"{value:,} ₽".replace(",", " ")


def fmt_date(date_iso: str) -> str:
    weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
    months = [
        "января", "февраля", "марта", "апреля", "мая", "июня",
        "июля", "августа", "сентября", "октября", "ноября", "декабря",
    ]
    d = dt.date.fromisoformat(date_iso)
    return f"{d.day} {months[d.month - 1]} ({weekdays[d.weekday()]})"
