"""Клавиатуры для клиентской части бота."""
from __future__ import annotations

from aiogram.types import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    KeyboardButton,
    ReplyKeyboardMarkup,
)

from bot.data.db import fmt_date, fmt_price
from bot.services.repo import Booking, Master, Service


def main_menu() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="✨ Записаться", callback_data="book:start")],
            [
                InlineKeyboardButton(text="📋 Мои записи", callback_data="my:list"),
                InlineKeyboardButton(text="💅 Услуги и цены", callback_data="info:prices"),
            ],
            [
                InlineKeyboardButton(text="📍 Адрес и график", callback_data="info:address"),
                InlineKeyboardButton(text="📞 Контакты", callback_data="info:contacts"),
            ],
            [InlineKeyboardButton(text="❓ Частые вопросы", callback_data="info:faq")],
        ]
    )


def back_to_menu() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="🏠 В главное меню", callback_data="menu:home")]
        ]
    )


def services_kb(services: list[Service]) -> InlineKeyboardMarkup:
    rows = [
        [InlineKeyboardButton(
            text=f"{s.title} — {fmt_price(s.price)}",
            callback_data=f"book:service:{s.id}",
        )]
        for s in services
    ]
    rows.append([InlineKeyboardButton(text="🏠 В главное меню", callback_data="menu:home")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def masters_kb(masters: list[Master]) -> InlineKeyboardMarkup:
    rows = [
        [InlineKeyboardButton(
            text=f"{m.name} · {m.role}",
            callback_data=f"book:master:{m.id}",
        )]
        for m in masters
    ]
    rows.append([InlineKeyboardButton(text="◀️ Назад", callback_data="book:start")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def dates_kb(dates: list[str]) -> InlineKeyboardMarkup:
    rows: list[list[InlineKeyboardButton]] = []
    row: list[InlineKeyboardButton] = []
    for d in dates:
        row.append(
            InlineKeyboardButton(text=fmt_date(d), callback_data=f"book:date:{d}")
        )
        if len(row) == 2:
            rows.append(row)
            row = []
    if row:
        rows.append(row)
    rows.append([InlineKeyboardButton(text="◀️ Назад", callback_data="book:back:master")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def times_kb(times: list[str]) -> InlineKeyboardMarkup:
    rows: list[list[InlineKeyboardButton]] = []
    row: list[InlineKeyboardButton] = []
    for t in times:
        row.append(InlineKeyboardButton(text=t, callback_data=f"book:time:{t}"))
        if len(row) == 3:
            rows.append(row)
            row = []
    if row:
        rows.append(row)
    rows.append([InlineKeyboardButton(text="◀️ Назад", callback_data="book:back:date")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def alternatives_kb(alts: list[tuple[str, str]]) -> InlineKeyboardMarkup:
    rows = [
        [InlineKeyboardButton(
            text=f"{fmt_date(d)} в {t}",
            callback_data=f"book:alt:{d}:{t}",
        )]
        for d, t in alts
    ]
    rows.append([InlineKeyboardButton(text="🏠 В главное меню", callback_data="menu:home")])
    return InlineKeyboardMarkup(inline_keyboard=rows)


def confirm_kb() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="✅ Подтвердить", callback_data="book:confirm"),
                InlineKeyboardButton(text="✖️ Отмена", callback_data="menu:home"),
            ]
        ]
    )


def share_phone_kb() -> ReplyKeyboardMarkup:
    return ReplyKeyboardMarkup(
        keyboard=[[KeyboardButton(text="📱 Поделиться номером", request_contact=True)]],
        resize_keyboard=True,
        one_time_keyboard=True,
    )


def my_bookings_kb(bookings: list[Booking]) -> InlineKeyboardMarkup:
    rows: list[list[InlineKeyboardButton]] = []
    for b in bookings:
        rows.append([
            InlineKeyboardButton(
                text=f"🔁 Перенести · {fmt_date(b.date)} {b.time}",
                callback_data=f"my:resched:{b.id}",
            ),
            InlineKeyboardButton(
                text="❌ Отменить",
                callback_data=f"my:cancel:{b.id}",
            ),
        ])
    rows.append([InlineKeyboardButton(text="🏠 В главное меню", callback_data="menu:home")])
    return InlineKeyboardMarkup(inline_keyboard=rows)
