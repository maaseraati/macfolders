"""Админ-панель: просмотр расписания, добавление услуг/мастеров, управление слотами."""
from __future__ import annotations

import datetime as dt

from aiogram import F, Router
from aiogram.filters import Command
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, Message

from bot.config import get_admin_ids
from bot.data.db import fmt_date, fmt_price, get_conn
from bot.keyboards.admin import (
    admin_back,
    admin_dates_kb,
    admin_masters_kb,
    admin_menu,
    admin_services_pick_kb,
    admin_slots_kb,
    booking_actions_kb,
)
from bot.services import repo
from bot.states.booking import AdminAddMaster, AdminAddService, AdminSlots

router = Router(name="admin")


def _is_admin(user_id: int | None) -> bool:
    return bool(user_id) and user_id in get_admin_ids()


# ───── Вход ─────

@router.message(Command("admin"))
async def admin_entry(message: Message, state: FSMContext) -> None:
    if not _is_admin(message.from_user.id if message.from_user else None):
        await message.answer(
            "Этот раздел доступен только администратору. Если вы владелец салона — "
            "укажите свой Telegram ID в .env (ADMIN_IDS)."
        )
        return
    await state.clear()
    await message.answer(
        "🛠 <b>Админ-панель</b>\nВыберите действие:",
        reply_markup=admin_menu(),
        parse_mode="HTML",
    )


@router.callback_query(F.data == "adm:home")
async def admin_home(call: CallbackQuery, state: FSMContext) -> None:
    if not _is_admin(call.from_user.id):
        await call.answer("Только для администратора", show_alert=True)
        return
    await state.clear()
    await _edit(call, "🛠 <b>Админ-панель</b>\nВыберите действие:", admin_menu())


# ───── Расписание ─────

@router.callback_query(F.data.startswith("adm:day:"))
async def admin_day(call: CallbackQuery) -> None:
    if not _is_admin(call.from_user.id):
        return
    offset = int(call.data.split(":")[2])
    date = (dt.date.today() + dt.timedelta(days=offset)).isoformat()
    bookings = await repo.list_bookings_by_date(date)
    if not bookings:
        text = f"📅 <b>{fmt_date(date)}</b>\n\nЗаписей нет."
    else:
        lines = [f"📅 <b>{fmt_date(date)}</b>\n"]
        for b in bookings:
            mark = {"new": "🕐", "confirmed": "✅"}.get(b.status, "•")
            lines.append(
                f"{mark} {b.time} · <b>{b.service_title}</b>\n"
                f"   👩‍🎨 {b.master_name}\n"
                f"   👤 {b.user_name} · {b.user_phone}\n"
                f"   /bk{b.id}"
            )
        text = "\n\n".join(lines)
    await _edit(call, text, admin_back())


@router.callback_query(F.data == "adm:week")
async def admin_week(call: CallbackQuery) -> None:
    if not _is_admin(call.from_user.id):
        return
    today = dt.date.today()
    end = today + dt.timedelta(days=6)
    bookings = await repo.list_bookings_range(today.isoformat(), end.isoformat())
    if not bookings:
        text = "🗓 <b>Неделя</b>\n\nЗаписей нет."
    else:
        lines = ["🗓 <b>Записи на неделю</b>\n"]
        cur_date = ""
        for b in bookings:
            if b.date != cur_date:
                cur_date = b.date
                lines.append(f"\n<b>{fmt_date(b.date)}</b>")
            lines.append(
                f"  {b.time} · {b.service_title} · {b.master_name} · {b.user_name} (/bk{b.id})"
            )
        text = "\n".join(lines)
    await _edit(call, text, admin_back())


@router.callback_query(F.data == "adm:all")
async def admin_all(call: CallbackQuery) -> None:
    if not _is_admin(call.from_user.id):
        return
    today = dt.date.today().isoformat()
    end = (dt.date.today() + dt.timedelta(days=30)).isoformat()
    bookings = await repo.list_bookings_range(today, end)
    if not bookings:
        text = "📋 Будущих записей пока нет."
    else:
        lines = ["📋 <b>Все будущие записи</b>\n"]
        for b in bookings:
            lines.append(
                f"#{b.id} · {fmt_date(b.date)} {b.time} · {b.service_title} · {b.master_name} · {b.user_name} (/bk{b.id})"
            )
        text = "\n".join(lines)
    await _edit(call, text, admin_back())


@router.message(F.text.regexp(r"^/bk\d+$"))
async def admin_open_booking(message: Message) -> None:
    if not _is_admin(message.from_user.id if message.from_user else None):
        return
    booking_id = int(message.text[3:])
    bk = await repo.get_booking(booking_id)
    if not bk:
        await message.answer("Запись не найдена.")
        return
    status_label = {"new": "🕐 Ожидает", "confirmed": "✅ Подтверждена", "cancelled": "❌ Отменена"}
    text = (
        f"📌 <b>Запись #{bk.id}</b>\n\n"
        f"💅 {bk.service_title}\n"
        f"👩‍🎨 {bk.master_name}\n"
        f"📅 {fmt_date(bk.date)} в {bk.time}\n"
        f"👤 {bk.user_name}\n"
        f"📞 {bk.user_phone}\n"
        f"Статус: {status_label.get(bk.status, bk.status)}"
    )
    await message.answer(text, reply_markup=booking_actions_kb(bk), parse_mode="HTML")


@router.callback_query(F.data.startswith("adm:bk:confirm:"))
async def admin_confirm_bk(call: CallbackQuery) -> None:
    if not _is_admin(call.from_user.id):
        return
    booking_id = int(call.data.split(":")[3])
    await repo.update_status(booking_id, "confirmed")
    bk = await repo.get_booking(booking_id)
    if bk:
        try:
            await call.bot.send_message(
                bk.user_id,
                f"✅ Ваша запись на <b>{fmt_date(bk.date)} в {bk.time}</b> подтверждена. До встречи!",
                parse_mode="HTML",
            )
        except Exception:
            pass
    await call.answer("Подтверждено", show_alert=False)
    if call.message:
        try:
            await call.message.edit_reply_markup(reply_markup=booking_actions_kb(bk) if bk else None)
        except Exception:
            pass


@router.callback_query(F.data.startswith("adm:bk:cancel:"))
async def admin_cancel_bk(call: CallbackQuery) -> None:
    if not _is_admin(call.from_user.id):
        return
    booking_id = int(call.data.split(":")[3])
    bk = await repo.cancel_booking(booking_id)
    if bk:
        try:
            await call.bot.send_message(
                bk.user_id,
                f"❌ Ваша запись на {fmt_date(bk.date)} {bk.time} была отменена администратором. "
                "Вы можете записаться снова в боте.",
            )
        except Exception:
            pass
    await call.answer("Запись отменена", show_alert=False)
    if call.message:
        try:
            await call.message.edit_reply_markup(reply_markup=booking_actions_kb(bk) if bk else None)
        except Exception:
            pass


# ───── Добавление услуги ─────

@router.callback_query(F.data == "adm:add:service")
async def add_service_start(call: CallbackQuery, state: FSMContext) -> None:
    if not _is_admin(call.from_user.id):
        return
    await state.set_state(AdminAddService.title)
    await _edit(call, "📝 Введите <b>название услуги</b>:", admin_back())


@router.message(AdminAddService.title, F.text)
async def add_service_title(message: Message, state: FSMContext) -> None:
    if not _is_admin(message.from_user.id if message.from_user else None):
        return
    await state.update_data(title=message.text.strip())
    await state.set_state(AdminAddService.price)
    await message.answer("💰 Введите цену (только число, в рублях):")


@router.message(AdminAddService.price, F.text)
async def add_service_price(message: Message, state: FSMContext) -> None:
    if not _is_admin(message.from_user.id if message.from_user else None):
        return
    text = (message.text or "").replace(" ", "")
    if not text.isdigit():
        await message.answer("Введите цену числом, например: 1500")
        return
    await state.update_data(price=int(text))
    await state.set_state(AdminAddService.duration)
    await message.answer("⏱ Длительность в минутах (например, 60):")


@router.message(AdminAddService.duration, F.text)
async def add_service_duration(message: Message, state: FSMContext) -> None:
    if not _is_admin(message.from_user.id if message.from_user else None):
        return
    text = (message.text or "").strip()
    if not text.isdigit() or not (10 <= int(text) <= 600):
        await message.answer("Введите целое число от 10 до 600.")
        return
    data = await state.get_data()
    sid = await repo.add_service(str(data["title"]), int(data["price"]), int(text))
    await state.clear()
    await message.answer(
        f"✅ Услуга добавлена: <b>{data['title']}</b> · {fmt_price(int(data['price']))} (id={sid}).\n"
        "Не забудьте привязать её к мастеру при добавлении мастера или повторно через меню.",
        reply_markup=admin_menu(),
        parse_mode="HTML",
    )


# ───── Добавление мастера ─────

@router.callback_query(F.data == "adm:add:master")
async def add_master_start(call: CallbackQuery, state: FSMContext) -> None:
    if not _is_admin(call.from_user.id):
        return
    await state.set_state(AdminAddMaster.name)
    await _edit(call, "👩‍🎨 Введите <b>имя мастера</b>:", admin_back())


@router.message(AdminAddMaster.name, F.text)
async def add_master_name(message: Message, state: FSMContext) -> None:
    if not _is_admin(message.from_user.id if message.from_user else None):
        return
    await state.update_data(name=message.text.strip())
    await state.set_state(AdminAddMaster.role)
    await message.answer("🧾 Введите специализацию (например, «Топ-мастер маникюра»):")


@router.message(AdminAddMaster.role, F.text)
async def add_master_role(message: Message, state: FSMContext) -> None:
    if not _is_admin(message.from_user.id if message.from_user else None):
        return
    await state.update_data(role=message.text.strip(), services=set())
    await state.set_state(AdminAddMaster.services)
    services = await repo.list_services()
    await message.answer(
        "Отметьте услуги, которые выполняет мастер, и нажмите «Сохранить»:",
        reply_markup=admin_services_pick_kb(services, set()),
    )


@router.callback_query(AdminAddMaster.services, F.data.startswith("adm:newm:svc:"))
async def add_master_pick_service(call: CallbackQuery, state: FSMContext) -> None:
    sid = int(call.data.split(":")[3])
    data = await state.get_data()
    chosen: set[int] = set(data.get("services", set()))
    if sid in chosen:
        chosen.remove(sid)
    else:
        chosen.add(sid)
    await state.update_data(services=chosen)
    services = await repo.list_services()
    if call.message:
        try:
            await call.message.edit_reply_markup(
                reply_markup=admin_services_pick_kb(services, chosen)
            )
        except Exception:
            pass
    await call.answer()


@router.callback_query(AdminAddMaster.services, F.data == "adm:newm:save")
async def add_master_save(call: CallbackQuery, state: FSMContext) -> None:
    data = await state.get_data()
    chosen: set[int] = set(data.get("services", set()))
    if not chosen:
        await call.answer("Выберите хотя бы одну услугу", show_alert=True)
        return
    mid = await repo.add_master(str(data["name"]), str(data["role"]))
    for sid in chosen:
        await repo.link_master_service(mid, sid)
    # Создадим слоты на ближайшие дни
    from bot.data.db import _ensure_slots  # noqa: WPS437 — внутренний хелпер
    async with get_conn() as conn:
        await _ensure_slots(conn, days=7)
        await conn.commit()
    await state.clear()
    await _edit(
        call,
        f"✅ Мастер <b>{data['name']}</b> добавлен (id={mid}). Слоты на неделю созданы.",
        admin_menu(),
    )


# ───── Управление слотами ─────

@router.callback_query(F.data == "adm:slots")
async def slots_start(call: CallbackQuery, state: FSMContext) -> None:
    if not _is_admin(call.from_user.id):
        return
    masters = await repo.list_all_masters()
    if not masters:
        await _edit(call, "Сначала добавьте мастеров.", admin_back())
        return
    await state.set_state(AdminSlots.pick_master)
    await _edit(call, "Выберите мастера:", admin_masters_kb(masters, action="slots:m"))


@router.callback_query(AdminSlots.pick_master, F.data.startswith("adm:slots:m:"))
async def slots_pick_master(call: CallbackQuery, state: FSMContext) -> None:
    master_id = int(call.data.split(":")[3])
    today = dt.date.today()
    dates = [(today + dt.timedelta(days=i)).isoformat() for i in range(7)]
    await state.update_data(master_id=master_id)
    await state.set_state(AdminSlots.pick_date)
    await _edit(
        call,
        "Выберите дату для управления слотами:",
        admin_dates_kb(dates, action_prefix=f"adm:slots:d"),
    )


@router.callback_query(AdminSlots.pick_date, F.data.startswith("adm:slots:d:"))
async def slots_pick_date(call: CallbackQuery, state: FSMContext) -> None:
    date = call.data.split(":", 3)[3]
    data = await state.get_data()
    master_id = int(data["master_id"])
    async with get_conn() as conn:
        async with conn.execute(
            "SELECT time, is_open FROM slots WHERE master_id = ? AND date = ? ORDER BY time",
            (master_id, date),
        ) as cur:
            rows = [(r[0], bool(r[1])) for r in await cur.fetchall()]
    if not rows:
        await _edit(call, "Слотов на эту дату нет.", admin_back())
        return
    await state.update_data(date=date)
    await state.set_state(AdminSlots.pick_slot)
    await _edit(
        call,
        f"⏰ Слоты на {fmt_date(date)}\n🟢 свободно · 🔴 занято\nНажмите, чтобы переключить.",
        admin_slots_kb(rows, master_id, date),
    )


@router.callback_query(AdminSlots.pick_slot, F.data.startswith("adm:slot:toggle:"))
async def slots_toggle(call: CallbackQuery, state: FSMContext) -> None:
    _, _, _, master_id, date, time = call.data.split(":", 5)
    async with get_conn() as conn:
        async with conn.execute(
            "SELECT is_open FROM slots WHERE master_id = ? AND date = ? AND time = ?",
            (int(master_id), date, time),
        ) as cur:
            row = await cur.fetchone()
        if row is None:
            await call.answer("Слот не найден")
            return
        new_state = 0 if row[0] else 1
        await conn.execute(
            "UPDATE slots SET is_open = ? WHERE master_id = ? AND date = ? AND time = ?",
            (new_state, int(master_id), date, time),
        )
        await conn.commit()
        async with conn.execute(
            "SELECT time, is_open FROM slots WHERE master_id = ? AND date = ? ORDER BY time",
            (int(master_id), date),
        ) as cur:
            rows = [(r[0], bool(r[1])) for r in await cur.fetchall()]
    if call.message:
        try:
            await call.message.edit_reply_markup(
                reply_markup=admin_slots_kb(rows, int(master_id), date)
            )
        except Exception:
            pass
    await call.answer("Готово")


# ───── helpers ─────

async def _edit(call: CallbackQuery, text: str, kb) -> None:
    if call.message:
        try:
            await call.message.edit_text(text, reply_markup=kb, parse_mode="HTML")
        except Exception:
            await call.message.answer(text, reply_markup=kb, parse_mode="HTML")
    await call.answer()
