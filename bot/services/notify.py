"""Уведомления администраторам."""
from __future__ import annotations

from aiogram import Bot
from aiogram.exceptions import TelegramAPIError

from bot.config import get_admin_ids


async def notify_admins(bot: Bot, text: str, *, reply_markup=None) -> None:
    for admin_id in get_admin_ids():
        try:
            await bot.send_message(admin_id, text, reply_markup=reply_markup)
        except TelegramAPIError:
            # Админ ещё не запускал бот / заблокировал — просто игнорируем
            continue
