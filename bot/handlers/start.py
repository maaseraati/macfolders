"""/start, главное меню."""
from __future__ import annotations

from aiogram import F, Router
from aiogram.filters import CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.types import CallbackQuery, Message

from bot.config import SALON
from bot.keyboards.client import main_menu

router = Router(name="start")


WELCOME = (
    "Здравствуйте! Это <b>{name}</b> ✨\n\n"
    "Здесь вы можете записаться к нашим мастерам за пару касаний — "
    "выберите услугу, удобное время и всё готово.\n\n"
    "С чего начнём?"
)


@router.message(CommandStart())
async def cmd_start(message: Message, state: FSMContext) -> None:
    await state.clear()
    await message.answer(
        WELCOME.format(name=SALON.name),
        reply_markup=main_menu(),
        parse_mode="HTML",
    )


@router.callback_query(F.data == "menu:home")
async def go_home(call: CallbackQuery, state: FSMContext) -> None:
    await state.clear()
    text = WELCOME.format(name=SALON.name)
    if call.message:
        try:
            await call.message.edit_text(text, reply_markup=main_menu(), parse_mode="HTML")
        except Exception:
            await call.message.answer(text, reply_markup=main_menu(), parse_mode="HTML")
    await call.answer()
