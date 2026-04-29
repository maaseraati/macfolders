"""Мои записи: просмотр, отмена, перенос."""
from __future__ import annotations

from aiogram import F, Router
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery

from bot.data.db import fmt_date
from bot.keyboards.client import (
    back_to_menu,
    dates_kb,
    my_bookings_kb,
    times_kb,
)
from bot.services import repo
from bot.states.booking import Reschedule

router = Router(name="manage")


@router.callback_query(F.data == "my:list")
async def my_list(call: CallbackQuery, state: FSMContext) -> None:
    await state.clear()
    bookings = await repo.list_user_bookings(call.from_user.id)
    if not bookings:
        await _edit(
            call,
            "У вас пока нет активных записей.\nЗапишитесь в один клик из главного меню ✨",
            back_to_menu(),
        )
        return

    lines = ["📋 <b>Ваши записи</b>\n"]
    for b in bookings:
        status_icon = {"new": "🕐", "confirmed": "✅", "cancelled": "❌"}.get(b.status, "•")
        lines.append(
            f"{status_icon} <b>{b.service_title}</b>\n"
            f"   👩‍🎨 {b.master_name}\n"
            f"   📅 {fmt_date(b.date)} в {b.time}"
        )
    await _edit(call, "\n\n".join(lines), my_bookings_kb(bookings))


@router.callback_query(F.data.startswith("my:cancel:"))
async def cancel_my(call: CallbackQuery) -> None:
    booking_id = int(call.data.split(":")[2])
    bk = await repo.get_booking(booking_id)
    if not bk or bk.user_id != call.from_user.id:
        await call.answer("Запись не найдена", show_alert=True)
        return
    await repo.cancel_booking(booking_id)
    await _edit(
        call,
        "Запись отменена. Будем рады видеть вас в другой раз 💛",
        back_to_menu(),
    )


@router.callback_query(F.data.startswith("my:resched:"))
async def reschedule_start(call: CallbackQuery, state: FSMContext) -> None:
    booking_id = int(call.data.split(":")[2])
    bk = await repo.get_booking(booking_id)
    if not bk or bk.user_id != call.from_user.id:
        await call.answer("Запись не найдена", show_alert=True)
        return
    dates = await repo.available_dates(bk.master_id)
    if not dates:
        await _edit(call, "Свободных дат у мастера сейчас нет.", back_to_menu())
        return
    await state.set_state(Reschedule.pick_date)
    await state.update_data(booking_id=booking_id, master_id=bk.master_id)
    await _edit(call, "📅 Выберите новую дату:", dates_kb(dates))


@router.callback_query(Reschedule.pick_date, F.data.startswith("book:date:"))
async def reschedule_pick_date(call: CallbackQuery, state: FSMContext) -> None:
    date = call.data.split(":", 2)[2]
    data = await state.get_data()
    times = await repo.available_times(int(data["master_id"]), date)
    if not times:
        await _edit(
            call,
            "На эту дату свободных слотов нет. Попробуйте другую дату.",
            back_to_menu(),
        )
        return
    await state.set_state(Reschedule.pick_time)
    await state.update_data(date=date)
    await _edit(call, f"🗓 {fmt_date(date)}\n\n⏰ Выберите новое время:", times_kb(times))


@router.callback_query(Reschedule.pick_time, F.data.startswith("book:time:"))
async def reschedule_pick_time(call: CallbackQuery, state: FSMContext) -> None:
    time = call.data.split(":", 2)[2]
    data = await state.get_data()
    bk = await repo.reschedule_booking(int(data["booking_id"]), str(data["date"]), time)
    await state.clear()
    if not bk:
        await _edit(call, "Не удалось перенести запись.", back_to_menu())
        return
    await _edit(
        call,
        f"🔁 Запись перенесена на <b>{fmt_date(bk.date)}</b> в <b>{bk.time}</b>. До встречи!",
        back_to_menu(),
    )


@router.callback_query(Reschedule.pick_time, F.data == "book:back:date")
async def reschedule_back_date(call: CallbackQuery, state: FSMContext) -> None:
    data = await state.get_data()
    dates = await repo.available_dates(int(data["master_id"]))
    await state.set_state(Reschedule.pick_date)
    await _edit(call, "📅 Выберите новую дату:", dates_kb(dates))


async def _edit(call: CallbackQuery, text: str, kb) -> None:
    if call.message:
        try:
            await call.message.edit_text(text, reply_markup=kb, parse_mode="HTML")
        except Exception:
            await call.message.answer(text, reply_markup=kb, parse_mode="HTML")
    await call.answer()
