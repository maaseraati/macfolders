"""Сценарий записи: услуга → мастер → дата → время → имя → телефон → подтверждение."""
from __future__ import annotations

import re

from aiogram import F, Router
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, Message, ReplyKeyboardRemove

from bot.data.db import fmt_date, fmt_price
from bot.keyboards.admin import booking_actions_kb
from bot.keyboards.client import (
    alternatives_kb,
    back_to_menu,
    confirm_kb,
    dates_kb,
    masters_kb,
    services_kb,
    share_phone_kb,
    times_kb,
)
from bot.services import repo
from bot.services.notify import notify_admins
from bot.states.booking import Booking

router = Router(name="booking")

PHONE_RE = re.compile(r"^[\d\+\-\s\(\)]{7,20}$")


# ───── Старт сценария ─────

@router.callback_query(F.data == "book:start")
async def book_start(call: CallbackQuery, state: FSMContext) -> None:
    await state.clear()
    services = await repo.list_services()
    if not services:
        await _edit(call, "Пока нет доступных услуг. Попробуйте позже.", back_to_menu())
        return
    await state.set_state(Booking.service)
    await _edit(
        call,
        "💎 <b>Выберите услугу</b>\nЭто займёт меньше минуты.",
        services_kb(services),
    )


@router.callback_query(Booking.service, F.data.startswith("book:service:"))
async def pick_service(call: CallbackQuery, state: FSMContext) -> None:
    service_id = int(call.data.split(":")[2])
    service = await repo.get_service(service_id)
    if not service:
        await call.answer("Услуга не найдена", show_alert=True)
        return
    masters = await repo.list_masters_for_service(service_id)
    if not masters:
        await _edit(
            call,
            "К этой услуге пока не привязан ни один мастер. Выберите другую услугу.",
            back_to_menu(),
        )
        return
    await state.update_data(service_id=service_id, service_title=service.title, service_price=service.price)
    await state.set_state(Booking.master)
    await _edit(
        call,
        f"🌿 <b>{service.title}</b> — {fmt_price(service.price)}\n\nВыберите мастера:",
        masters_kb(masters),
    )


@router.callback_query(Booking.master, F.data.startswith("book:master:"))
async def pick_master(call: CallbackQuery, state: FSMContext) -> None:
    master_id = int(call.data.split(":")[2])
    master = await repo.get_master(master_id)
    if not master:
        await call.answer("Мастер не найден", show_alert=True)
        return
    dates = await repo.available_dates(master_id)
    if not dates:
        await _edit(
            call,
            f"У мастера {master.name} сейчас нет свободных слотов. Попробуйте другого мастера.",
            back_to_menu(),
        )
        return
    await state.update_data(master_id=master_id, master_name=master.name)
    await state.set_state(Booking.date)
    await _edit(
        call,
        f"👩‍🎨 Мастер: <b>{master.name}</b>\n\n📅 Выберите дату:",
        dates_kb(dates),
    )


@router.callback_query(Booking.date, F.data == "book:back:master")
async def back_to_master(call: CallbackQuery, state: FSMContext) -> None:
    data = await state.get_data()
    masters = await repo.list_masters_for_service(int(data["service_id"]))
    await state.set_state(Booking.master)
    await _edit(call, "Выберите мастера:", masters_kb(masters))


@router.callback_query(Booking.date, F.data.startswith("book:date:"))
async def pick_date(call: CallbackQuery, state: FSMContext) -> None:
    date = call.data.split(":", 2)[2]
    data = await state.get_data()
    times = await repo.available_times(int(data["master_id"]), date)
    if not times:
        # предлагаем ближайшие
        alts = await repo.closest_alternatives(int(data["master_id"]), date)
        if not alts:
            await _edit(call, "К сожалению, свободных слотов нет.", back_to_menu())
            return
        await _edit(
            call,
            "На эту дату свободных слотов уже нет. "
            "Вот ближайшие свободные варианты — выбирайте удобный 👇",
            alternatives_kb(alts),
        )
        return
    await state.update_data(date=date)
    await state.set_state(Booking.time)
    await _edit(call, f"🗓 {fmt_date(date)}\n\n⏰ Выберите время:", times_kb(times))


@router.callback_query(Booking.time, F.data == "book:back:date")
async def back_to_date(call: CallbackQuery, state: FSMContext) -> None:
    data = await state.get_data()
    dates = await repo.available_dates(int(data["master_id"]))
    await state.set_state(Booking.date)
    await _edit(call, "📅 Выберите дату:", dates_kb(dates))


@router.callback_query(F.data.startswith("book:alt:"))
async def pick_alternative(call: CallbackQuery, state: FSMContext) -> None:
    _, _, date, time = call.data.split(":", 3)
    await state.update_data(date=date, time=time)
    await state.set_state(Booking.name)
    await _ask_name(call)


@router.callback_query(Booking.time, F.data.startswith("book:time:"))
async def pick_time(call: CallbackQuery, state: FSMContext) -> None:
    time = call.data.split(":", 2)[2]
    await state.update_data(time=time)
    await state.set_state(Booking.name)
    await _ask_name(call)


async def _ask_name(call: CallbackQuery) -> None:
    text = "👋 Как к вам обращаться? Напишите ваше <b>имя</b>:"
    if call.message:
        try:
            await call.message.edit_text(text, parse_mode="HTML")
        except Exception:
            await call.message.answer(text, parse_mode="HTML")
    await call.answer()


# ───── Имя ─────

@router.message(Booking.name, F.text)
async def got_name(message: Message, state: FSMContext) -> None:
    name = (message.text or "").strip()
    if len(name) < 2 or len(name) > 60:
        await message.answer("Имя должно быть от 2 до 60 символов. Попробуйте ещё раз 🙂")
        return
    await state.update_data(user_name=name)
    await state.set_state(Booking.phone)
    await message.answer(
        "📱 Оставьте номер телефона — администратор свяжется при необходимости.\n"
        "Можно ввести вручную или поделиться контактом кнопкой ниже.",
        reply_markup=share_phone_kb(),
    )


# ───── Телефон ─────

@router.message(Booking.phone, F.contact)
async def got_phone_contact(message: Message, state: FSMContext) -> None:
    if not message.contact or not message.contact.phone_number:
        await message.answer("Не удалось прочитать контакт. Введите телефон вручную.")
        return
    phone = message.contact.phone_number
    if not phone.startswith("+"):
        phone = "+" + phone
    await _save_phone_and_confirm(message, state, phone)


@router.message(Booking.phone, F.text)
async def got_phone_text(message: Message, state: FSMContext) -> None:
    phone = (message.text or "").strip()
    if not PHONE_RE.match(phone):
        await message.answer(
            "Похоже, это не телефон. Пример: +7 900 123-45-67.\nПопробуйте ещё раз 🙏"
        )
        return
    await _save_phone_and_confirm(message, state, phone)


async def _save_phone_and_confirm(message: Message, state: FSMContext, phone: str) -> None:
    await state.update_data(user_phone=phone)
    data = await state.get_data()
    summary = (
        "🪞 <b>Проверим запись</b>\n\n"
        f"💅 Услуга: <b>{data['service_title']}</b> — {fmt_price(int(data['service_price']))}\n"
        f"👩‍🎨 Мастер: <b>{data['master_name']}</b>\n"
        f"📅 Дата: <b>{fmt_date(data['date'])}</b>\n"
        f"⏰ Время: <b>{data['time']}</b>\n"
        f"👤 Имя: {data['user_name']}\n"
        f"📞 Телефон: {phone}\n\n"
        "Всё верно?"
    )
    await state.set_state(Booking.confirm)
    await message.answer(summary, reply_markup=ReplyKeyboardRemove(), parse_mode="HTML")
    await message.answer("Подтвердите запись 👇", reply_markup=confirm_kb())


# ───── Подтверждение ─────

@router.callback_query(Booking.confirm, F.data == "book:confirm")
async def confirm_booking(call: CallbackQuery, state: FSMContext) -> None:
    data = await state.get_data()

    # Проверим, что слот всё ещё свободен
    times = await repo.available_times(int(data["master_id"]), data["date"])
    if data["time"] not in times:
        alts = await repo.closest_alternatives(int(data["master_id"]), data["date"])
        await state.set_state(Booking.date)
        await _edit(
            call,
            "Кто-то успел занять этот слот раньше 😔 Вот ближайшие свободные варианты:",
            alternatives_kb(alts) if alts else back_to_menu(),
        )
        return

    booking_id = await repo.create_booking(
        user_id=call.from_user.id,
        user_name=str(data["user_name"]),
        user_phone=str(data["user_phone"]),
        service_id=int(data["service_id"]),
        master_id=int(data["master_id"]),
        date=str(data["date"]),
        time=str(data["time"]),
    )
    await state.clear()

    text = (
        "🎉 <b>Запись создана!</b>\n\n"
        f"💅 {data['service_title']}\n"
        f"👩‍🎨 Мастер: {data['master_name']}\n"
        f"📅 {fmt_date(data['date'])} в <b>{data['time']}</b>\n\n"
        "Будем ждать вас! Если планы изменятся — управляйте записью в разделе "
        "«Мои записи» в главном меню."
    )
    await _edit(call, text, back_to_menu())

    bk = await repo.get_booking(booking_id)
    if bk:
        admin_text = (
            "🔔 <b>Новая запись</b>\n\n"
            f"#{bk.id} · {bk.service_title}\n"
            f"👩‍🎨 {bk.master_name}\n"
            f"📅 {fmt_date(bk.date)} в {bk.time}\n"
            f"👤 {bk.user_name}\n"
            f"📞 {bk.user_phone}"
        )
        await notify_admins(call.bot, admin_text, reply_markup=booking_actions_kb(bk))


# ───── helpers ─────

async def _edit(call: CallbackQuery, text: str, kb) -> None:
    if call.message:
        try:
            await call.message.edit_text(text, reply_markup=kb, parse_mode="HTML")
        except Exception:
            await call.message.answer(text, reply_markup=kb, parse_mode="HTML")
    await call.answer()
