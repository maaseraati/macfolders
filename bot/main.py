"""Точка входа: запуск aiogram-бота на long polling."""
from __future__ import annotations

import asyncio
import logging

from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.fsm.storage.memory import MemoryStorage

from bot.config import SALON, get_bot_token
from bot.data.db import init_db
from bot.handlers import build_router


async def main() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    )
    log = logging.getLogger("bot")
    log.info("Инициализация БД…")
    await init_db()

    bot = Bot(
        token=get_bot_token(),
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
    )
    dp = Dispatcher(storage=MemoryStorage())
    dp.include_router(build_router())

    log.info("Запуск бота для салона: %s", SALON.name)
    await bot.delete_webhook(drop_pending_updates=True)
    await dp.start_polling(bot)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        pass
