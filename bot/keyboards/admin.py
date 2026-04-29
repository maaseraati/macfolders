"""Клавиатуры для админ-панели."""
from __future__ import annotations

import datetime as dt

from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup

from bot.data.db import fmt_date
from bot.services.repo import Booking, Master, Service


def admin_menu() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="📅 На сегодня", callback_data="adm:day:0"),
                InlineKeyboardButton(text="🗓 На неделю", callback_data="adm:week"),
            ],
            [InlineKeyboardButton(text="📋 Все будущие записи", callback_data="adm:all")],
            [
                InlineKeyboardButton(text="➕ Услуга", callback_data="adm:add:service"),
                InlineKeyboardButton(text="➕ Мастер", callback_data="adm:add:master"),
            ],
            [InlineKeyboardButton(text="⏰ Управление слотами", callback_data="adm:slots")],
            [InlineKeyboardButton(text="🏠 В клиентское меню", callback_data="menu:home")],
        ]
    )


def admin_back() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="◀️ В админ-меню", callback_data="adm:home")]
        ]
    )


def booking_actions_kb(booking: Booking) -> InlineKeyboardMarkup:
    rows = []
    if booking.status != "confirmed":
        rows.append([
            InlineKeyboardButton(
                text="✅ Подтвердить",
                callback_data=f"adm:bk:confirm:{booking.id}",
            ),
        ])
    if booking.status != "cancelled":
        rows.append([
            InlineKeyboardButton(
                text="❌ Отменить запись",
                callback_data=f"adm:bk:cancel:{booking.id}",
            ),
        ])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def admin_masters_kb(masters: list[Master], action: str) -> InlineKeyboardMarkup:
    rows = [
        [InlineKeyboardButton(text=f"{m.name} · {m.role}", callback_data=f"adm:{action}:{m.id}")]
        for m in masters
    ]
    rows.append([InlineKeyboardButton(text="◀️ В админ-меню", callback_data="adm:home")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def admin_dates_kb(dates: list[str], action_prefix: str) -> InlineKeyboardMarkup:
    rows: list[list[InlineKeyboardButton]] = []
    row: list[InlineKeyboardButton] = []
    for d in dates:
        row.append(InlineKeyboardButton(text=fmt_date(d), callback_data=f"{action_prefix}:{d}"))
        if len(row) == 2:
            rows.append(row)
            row = []
    if row:
        rows.append(row)
    rows.append([InlineKeyboardButton(text="◀️ В админ-меню", callback_data="adm:home")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def admin_slots_kb(slots: list[tuple[str, bool]], master_id: int, date: str) -> InlineKeyboardMarkup:
    """slots: [(time, is_open), ...]"""
    rows: list[list[InlineKeyboardButton]] = []
    row: list[InlineKeyboardButton] = []
    for time, is_open in slots:
        mark = "🟢" if is_open else "🔴"
        row.append(
            InlineKeyboardButton(
                text=f"{mark} {time}",
                callback_data=f"adm:slot:toggle:{master_id}:{date}:{time}",
            )
        )
        if len(row) == 3:
            rows.append(row)
            row = []
    if row:
        rows.append(row)
    rows.append([InlineKeyboardButton(text="◀️ В админ-меню", callback_data="adm:home")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def admin_services_pick_kb(services: list[Service], chosen: set[int]) -> InlineKeyboardMarkup:
    rows = [
        [InlineKeyboardButton(
            text=("✅ " if s.id in chosen else "▫️ ") + s.title,
            callback_data=f"adm:newm:svc:{s.id}",
        )]
        for s in services
    ]
    rows.append([InlineKeyboardButton(text="💾 Сохранить мастера", callback_data="adm:newm:save")])
    return InlineKeyboardMarkup(inline_keyboard=rows)
