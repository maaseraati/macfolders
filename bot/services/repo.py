"""Запросы к БД: услуги, мастера, слоты, записи."""
from __future__ import annotations

import datetime as dt
from dataclasses import dataclass
from typing import Optional

from bot.data.db import get_conn


# ───── Datatypes ─────

@dataclass
class Service:
    id: int
    title: str
    price: int
    duration: int


@dataclass
class Master:
    id: int
    name: str
    role: str


@dataclass
class Booking:
    id: int
    user_id: int
    user_name: str
    user_phone: str
    service_id: int
    master_id: int
    date: str
    time: str
    status: str
    created_at: str
    service_title: Optional[str] = None
    master_name: Optional[str] = None


# ───── Services / Masters ─────

async def list_services() -> list[Service]:
    async with get_conn() as conn:
        async with conn.execute(
            "SELECT id, title, price, duration FROM services WHERE is_active = 1 ORDER BY id"
        ) as cur:
            return [Service(**dict(row)) for row in await cur.fetchall()]


async def get_service(service_id: int) -> Optional[Service]:
    async with get_conn() as conn:
        async with conn.execute(
            "SELECT id, title, price, duration FROM services WHERE id = ?",
            (service_id,),
        ) as cur:
            row = await cur.fetchone()
    return Service(**dict(row)) if row else None


async def list_masters_for_service(service_id: int) -> list[Master]:
    async with get_conn() as conn:
        async with conn.execute(
            """
            SELECT m.id, m.name, m.role
            FROM masters m
            JOIN master_services ms ON ms.master_id = m.id
            WHERE m.is_active = 1 AND ms.service_id = ?
            ORDER BY m.id
            """,
            (service_id,),
        ) as cur:
            return [Master(**dict(row)) for row in await cur.fetchall()]


async def list_all_masters() -> list[Master]:
    async with get_conn() as conn:
        async with conn.execute(
            "SELECT id, name, role FROM masters WHERE is_active = 1 ORDER BY id"
        ) as cur:
            return [Master(**dict(row)) for row in await cur.fetchall()]


async def get_master(master_id: int) -> Optional[Master]:
    async with get_conn() as conn:
        async with conn.execute(
            "SELECT id, name, role FROM masters WHERE id = ?", (master_id,)
        ) as cur:
            row = await cur.fetchone()
    return Master(**dict(row)) if row else None


async def add_service(title: str, price: int, duration: int = 60) -> int:
    async with get_conn() as conn:
        cur = await conn.execute(
            "INSERT INTO services (title, price, duration) VALUES (?, ?, ?)",
            (title, price, duration),
        )
        await conn.commit()
        return cur.lastrowid


async def add_master(name: str, role: str = "Мастер") -> int:
    async with get_conn() as conn:
        cur = await conn.execute(
            "INSERT INTO masters (name, role) VALUES (?, ?)", (name, role)
        )
        await conn.commit()
        return cur.lastrowid


async def link_master_service(master_id: int, service_id: int) -> None:
    async with get_conn() as conn:
        await conn.execute(
            "INSERT OR IGNORE INTO master_services (master_id, service_id) VALUES (?, ?)",
            (master_id, service_id),
        )
        await conn.commit()


# ───── Slots ─────

async def available_dates(master_id: int) -> list[str]:
    """Даты на ближайшие дни, где у мастера есть свободные слоты (>= сегодня)."""
    today = dt.date.today().isoformat()
    async with get_conn() as conn:
        async with conn.execute(
            """
            SELECT DISTINCT date FROM slots
            WHERE master_id = ? AND date >= ? AND is_open = 1
            ORDER BY date
            """,
            (master_id, today),
        ) as cur:
            return [row[0] for row in await cur.fetchall()]


async def available_times(master_id: int, date: str) -> list[str]:
    now = dt.datetime.now()
    async with get_conn() as conn:
        async with conn.execute(
            """
            SELECT time FROM slots
            WHERE master_id = ? AND date = ? AND is_open = 1
            ORDER BY time
            """,
            (master_id, date),
        ) as cur:
            times = [row[0] for row in await cur.fetchall()]
    # отфильтруем уже прошедшие слоты на сегодня
    if date == now.date().isoformat():
        times = [t for t in times if t > now.strftime("%H:%M")]
    return times


async def closest_alternatives(master_id: int, date: str, *, limit: int = 3) -> list[tuple[str, str]]:
    """Если слот занят — вернёт ближайшие свободные (date, time)."""
    today = dt.date.today().isoformat()
    start = max(date, today)
    async with get_conn() as conn:
        async with conn.execute(
            """
            SELECT date, time FROM slots
            WHERE master_id = ? AND date >= ? AND is_open = 1
            ORDER BY date, time LIMIT ?
            """,
            (master_id, start, limit),
        ) as cur:
            return [(row[0], row[1]) for row in await cur.fetchall()]


async def close_slot(master_id: int, date: str, time: str) -> None:
    async with get_conn() as conn:
        await conn.execute(
            "UPDATE slots SET is_open = 0 WHERE master_id = ? AND date = ? AND time = ?",
            (master_id, date, time),
        )
        await conn.commit()


async def open_slot(master_id: int, date: str, time: str) -> None:
    async with get_conn() as conn:
        await conn.execute(
            "UPDATE slots SET is_open = 1 WHERE master_id = ? AND date = ? AND time = ?",
            (master_id, date, time),
        )
        await conn.commit()


# ───── Bookings ─────

async def create_booking(
    *,
    user_id: int,
    user_name: str,
    user_phone: str,
    service_id: int,
    master_id: int,
    date: str,
    time: str,
) -> int:
    async with get_conn() as conn:
        cur = await conn.execute(
            """
            INSERT INTO bookings
                (user_id, user_name, user_phone, service_id, master_id, date, time)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (user_id, user_name, user_phone, service_id, master_id, date, time),
        )
        await conn.execute(
            "UPDATE slots SET is_open = 0 WHERE master_id = ? AND date = ? AND time = ?",
            (master_id, date, time),
        )
        await conn.commit()
        return cur.lastrowid


async def get_booking(booking_id: int) -> Optional[Booking]:
    async with get_conn() as conn:
        async with conn.execute(
            """
            SELECT b.*, s.title AS service_title, m.name AS master_name
            FROM bookings b
            JOIN services s ON s.id = b.service_id
            JOIN masters  m ON m.id = b.master_id
            WHERE b.id = ?
            """,
            (booking_id,),
        ) as cur:
            row = await cur.fetchone()
    if not row:
        return None
    data = dict(row)
    return Booking(**data)


async def list_user_bookings(user_id: int, *, only_active: bool = True) -> list[Booking]:
    today = dt.date.today().isoformat()
    sql = (
        """
        SELECT b.*, s.title AS service_title, m.name AS master_name
        FROM bookings b
        JOIN services s ON s.id = b.service_id
        JOIN masters  m ON m.id = b.master_id
        WHERE b.user_id = ?
        """
    )
    params: list = [user_id]
    if only_active:
        sql += " AND b.status != 'cancelled' AND b.date >= ?"
        params.append(today)
    sql += " ORDER BY b.date, b.time"
    async with get_conn() as conn:
        async with conn.execute(sql, params) as cur:
            return [Booking(**dict(r)) for r in await cur.fetchall()]


async def list_bookings_by_date(date: str) -> list[Booking]:
    async with get_conn() as conn:
        async with conn.execute(
            """
            SELECT b.*, s.title AS service_title, m.name AS master_name
            FROM bookings b
            JOIN services s ON s.id = b.service_id
            JOIN masters  m ON m.id = b.master_id
            WHERE b.date = ? AND b.status != 'cancelled'
            ORDER BY b.time
            """,
            (date,),
        ) as cur:
            return [Booking(**dict(r)) for r in await cur.fetchall()]


async def list_bookings_range(date_from: str, date_to: str) -> list[Booking]:
    async with get_conn() as conn:
        async with conn.execute(
            """
            SELECT b.*, s.title AS service_title, m.name AS master_name
            FROM bookings b
            JOIN services s ON s.id = b.service_id
            JOIN masters  m ON m.id = b.master_id
            WHERE b.date BETWEEN ? AND ? AND b.status != 'cancelled'
            ORDER BY b.date, b.time
            """,
            (date_from, date_to),
        ) as cur:
            return [Booking(**dict(r)) for r in await cur.fetchall()]


async def update_status(booking_id: int, status: str) -> None:
    async with get_conn() as conn:
        await conn.execute(
            "UPDATE bookings SET status = ? WHERE id = ?", (status, booking_id)
        )
        await conn.commit()


async def cancel_booking(booking_id: int) -> Optional[Booking]:
    bk = await get_booking(booking_id)
    if not bk:
        return None
    async with get_conn() as conn:
        await conn.execute(
            "UPDATE bookings SET status = 'cancelled' WHERE id = ?", (booking_id,)
        )
        await conn.execute(
            "UPDATE slots SET is_open = 1 WHERE master_id = ? AND date = ? AND time = ?",
            (bk.master_id, bk.date, bk.time),
        )
        await conn.commit()
    bk.status = "cancelled"
    return bk


async def reschedule_booking(booking_id: int, new_date: str, new_time: str) -> Optional[Booking]:
    bk = await get_booking(booking_id)
    if not bk:
        return None
    async with get_conn() as conn:
        # освобождаем старый слот
        await conn.execute(
            "UPDATE slots SET is_open = 1 WHERE master_id = ? AND date = ? AND time = ?",
            (bk.master_id, bk.date, bk.time),
        )
        # занимаем новый
        await conn.execute(
            "UPDATE slots SET is_open = 0 WHERE master_id = ? AND date = ? AND time = ?",
            (bk.master_id, new_date, new_time),
        )
        await conn.execute(
            "UPDATE bookings SET date = ?, time = ?, status = 'new' WHERE id = ?",
            (new_date, new_time, booking_id),
        )
        await conn.commit()
    bk.date = new_date
    bk.time = new_time
    bk.status = "new"
    return bk
