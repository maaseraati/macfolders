"""FSM-состояния для процесса записи и админ-операций."""
from aiogram.fsm.state import State, StatesGroup


class Booking(StatesGroup):
    service = State()
    master = State()
    date = State()
    time = State()
    name = State()
    phone = State()
    confirm = State()


class Reschedule(StatesGroup):
    pick_booking = State()
    pick_date = State()
    pick_time = State()


class AdminAddService(StatesGroup):
    title = State()
    price = State()
    duration = State()


class AdminAddMaster(StatesGroup):
    name = State()
    role = State()
    services = State()


class AdminSlots(StatesGroup):
    pick_master = State()
    pick_date = State()
    pick_slot = State()
