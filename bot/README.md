# Beauty Salon Bot — демо для Telegram

Готовый к показу клиенту демо-бот для салона красоты / маникюра / бровей / барбершопа.
Удобная запись через Telegram, уведомления администратору, управление расписанием.

> Один бот, без тарифов, без лишней сложности — но выглядит как настоящий продукт.

## Возможности

### Для клиента
- `/start` — приветствие и главное меню
- ✨ Запись: услуга → мастер → дата → свободное время → имя → телефон → подтверждение
- 📋 Мои записи: перенос и отмена
- 📍 Адрес и график, 📞 контакты, 💅 услуги и цены, ❓ FAQ
- Если выбранный слот занят — бот сам предложит ближайшие свободные

### Для администратора
- Команда `/admin` (доступна только Telegram ID из `ADMIN_IDS`)
- 📅 Расписание на день / неделю
- 📋 Все будущие записи, открытие карточки командой `/bkN`
- ✅ Подтверждение / ❌ отмена записи (клиент получает уведомление)
- ➕ Добавление услуг
- ➕ Добавление мастеров с привязкой услуг
- ⏰ Управление рабочими слотами (открыть/закрыть)
- 🔔 Мгновенное уведомление о каждой новой записи

## Технологии

- Python 3.11+
- [aiogram 3](https://docs.aiogram.dev/) — Telegram Bot API
- aiosqlite — асинхронная SQLite
- FSM (`aiogram.fsm`) — пошаговая запись
- python-dotenv — конфиг через `.env`

## Структура проекта

```
bot/
├── main.py                 # точка входа
├── config.py               # настройки + контактные данные салона
├── schema.sql              # схема БД
├── requirements.txt
├── .env.example
├── README.md
├── data/
│   └── db.py               # инициализация БД, seed демо-данных, генерация слотов
├── services/
│   ├── repo.py             # работа с данными: услуги, мастера, слоты, записи
│   └── notify.py           # уведомления админам
├── states/
│   └── booking.py          # FSM-состояния
├── keyboards/
│   ├── client.py           # инлайн-клавиатуры клиента
│   └── admin.py            # инлайн-клавиатуры админ-панели
└── handlers/
    ├── start.py            # /start, главное меню
    ├── info.py             # цены, контакты, адрес, FAQ
    ├── booking.py          # сценарий записи (FSM)
    ├── manage.py           # «Мои записи»: перенос/отмена
    └── admin.py            # /admin и админ-операции
```

## Схема БД

```
services(id, title, price, duration, is_active)
masters(id, name, role, is_active)
master_services(master_id, service_id)               -- какой мастер делает какую услугу
slots(id, master_id, date, time, is_open)            -- рабочие слоты
bookings(id, user_id, user_name, user_phone, service_id, master_id, date, time, status, created_at)
```

При первом запуске бот сам:
- создаёт таблицы из `schema.sql`,
- наполняет демо-услугами и мастерами (4 услуги, 3 мастера),
- генерирует слоты на 7 дней вперёд (Пн–Сб 10–20, Вс 11–18, шаг 60 мин).

## Демо-данные

| Услуга | Цена | Длит. | Мастер |
|---|---|---|---|
| Маникюр классический | 1 500 ₽ | 60 мин | Анна (топ-мастер маникюра) |
| Маникюр + гель-лак | 2 500 ₽ | 90 мин | Анна |
| Оформление и окрашивание бровей | 1 200 ₽ | 45 мин | Мария (бровист, визажист) |
| Женская стрижка + укладка | 2 000 ₽ | 60 мин | Ольга (парикмахер-стилист) |

## Запуск

### 1) Получите токен у [@BotFather](https://t.me/BotFather) и узнайте свой ID у [@userinfobot](https://t.me/userinfobot).

### 2) Подготовьте окружение

```bash
cd bot
python -m venv .venv
source .venv/bin/activate         # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# отредактируйте .env: BOT_TOKEN и ADMIN_IDS
```

### 3) Запустите

Из корня репозитория (важно — модуль запускается как пакет):

```bash
python -m bot.main
```

Бот сам создаст `bot/salon.db` при первом старте.

### 4) Проверьте

- В Telegram отправьте боту `/start` — увидите главное меню.
- Запишитесь — администратор получит уведомление.
- Из аккаунта-администратора отправьте `/admin` — откроется админ-панель.

## Как переименовать под другой салон

Все названия и контакты собраны в одном месте — `bot/config.py`, объект `Salon`:

```python
@dataclass(frozen=True)
class Salon:
    name: str = "Студия красоты «Лоск»"
    short_name: str = "Лоск"
    phone: str = "+7 (900) 000-00-00"
    address: str = "г. Москва, ул. Примерная, 12, 1 этаж"
    schedule: str = "Пн–Сб: 10:00–21:00\nВс: 11:00–19:00"
    instagram: str = "@losk.studio"
    map_url: str = "https://yandex.ru/maps/"
```

Достаточно поменять эти значения — название, телефон, адрес и график подтянутся
во все сообщения. Услуги и мастеров можно добавлять прямо из админ-панели бота
(или править начальные данные в `bot/data/db.py`, функция `_seed_demo`).

## Деплой

Простейший вариант — systemd-сервис на любой VM с Python 3.11+:

```ini
[Unit]
Description=Beauty Salon Telegram Bot
After=network.target

[Service]
WorkingDirectory=/opt/salon-bot
ExecStart=/opt/salon-bot/.venv/bin/python -m bot.main
EnvironmentFile=/opt/salon-bot/bot/.env
Restart=always

[Install]
WantedBy=multi-user.target
```

Также подойдёт Docker, Render, Railway, Fly.io — для long polling нужна только
исходящая сеть до `api.telegram.org`.
