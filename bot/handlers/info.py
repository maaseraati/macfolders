"""Статичные информационные блоки: цены, контакты, адрес, FAQ."""
from __future__ import annotations

from aiogram import F, Router
from aiogram.types import CallbackQuery

from bot.config import SALON
from bot.data.db import fmt_price
from bot.keyboards.client import back_to_menu
from bot.services.repo import list_services

router = Router(name="info")


@router.callback_query(F.data == "info:prices")
async def show_prices(call: CallbackQuery) -> None:
    services = await list_services()
    if not services:
        text = "Список услуг скоро появится. Загляните чуть позже ✨"
    else:
        lines = ["💅 <b>Услуги и цены</b>\n"]
        for s in services:
            lines.append(f"• <b>{s.title}</b> — {fmt_price(s.price)} · {s.duration} мин")
        lines.append("\nЗапись доступна в один клик — кнопка «Записаться» в главном меню.")
        text = "\n".join(lines)
    await _safe_edit(call, text)


@router.callback_query(F.data == "info:contacts")
async def show_contacts(call: CallbackQuery) -> None:
    text = (
        "📞 <b>Контакты</b>\n\n"
        f"• Телефон: <a href='tel:{SALON.phone.replace(' ', '')}'>{SALON.phone}</a>\n"
        f"• Instagram: {SALON.instagram}\n\n"
        "Мы всегда на связи — пишите, если возникнут вопросы 💬"
    )
    await _safe_edit(call, text)


@router.callback_query(F.data == "info:address")
async def show_address(call: CallbackQuery) -> None:
    text = (
        "📍 <b>Адрес и график</b>\n\n"
        f"<b>{SALON.name}</b>\n"
        f"{SALON.address}\n\n"
        f"🕒 <b>График работы:</b>\n{SALON.schedule}\n\n"
        f"<a href='{SALON.map_url}'>Открыть на карте →</a>"
    )
    await _safe_edit(call, text)


@router.callback_query(F.data == "info:faq")
async def show_faq(call: CallbackQuery) -> None:
    text = (
        "❓ <b>Частые вопросы</b>\n\n"
        "<b>Как записаться?</b>\n"
        "Нажмите «Записаться» в главном меню и выберите услугу, мастера и время.\n\n"
        "<b>Можно ли перенести запись?</b>\n"
        "Да, в разделе «Мои записи». Желательно — не позднее, чем за 3 часа.\n\n"
        "<b>Что если опаздываю?</b>\n"
        "Позвоните нам — мы постараемся подстроиться 💛\n\n"
        "<b>Какая оплата?</b>\n"
        "Принимаем наличные и карту в студии."
    )
    await _safe_edit(call, text)


async def _safe_edit(call: CallbackQuery, text: str) -> None:
    if call.message:
        try:
            await call.message.edit_text(
                text,
                reply_markup=back_to_menu(),
                parse_mode="HTML",
                disable_web_page_preview=True,
            )
        except Exception:
            await call.message.answer(
                text,
                reply_markup=back_to_menu(),
                parse_mode="HTML",
                disable_web_page_preview=True,
            )
    await call.answer()
