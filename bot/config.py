"""Конфигурация бота и данные салона.

Чтобы переименовать бота под другой салон — измените значения в SALON.
Токен и ID администратора берутся из переменных окружения (.env).
"""
from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")


@dataclass(frozen=True)
class Salon:
    name: str = "Студия красоты «Лоск»"
    short_name: str = "Лоск"
    phone: str = "+7 (900) 000-00-00"
    address: str = "г. Москва, ул. Примерная, 12, 1 этаж"
    schedule: str = "Пн–Сб: 10:00–21:00\nВс: 11:00–19:00"
    instagram: str = "@losk.studio"
    map_url: str = "https://yandex.ru/maps/"
    # Параметры расписания
    work_start_hour: int = 10
    work_end_hour: int = 20  # последний слот начинается в 19:00
    slot_minutes: int = 60   # шаг слотов
    days_ahead: int = 7      # на сколько дней вперёд показывать запись


SALON = Salon()


def get_bot_token() -> str:
    token = os.getenv("BOT_TOKEN", "").strip()
    if not token:
        raise RuntimeError(
            "BOT_TOKEN не задан. Создайте .env по образцу .env.example."
        )
    return token


def get_admin_ids() -> set[int]:
    raw = os.getenv("ADMIN_IDS", "").strip()
    if not raw:
        return set()
    ids: set[int] = set()
    for part in raw.replace(";", ",").split(","):
        part = part.strip()
        if part.isdigit():
            ids.add(int(part))
    return ids


DB_PATH = Path(os.getenv("DB_PATH", BASE_DIR / "salon.db"))
