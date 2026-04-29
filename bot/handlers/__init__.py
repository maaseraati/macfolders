from aiogram import Router

from . import admin, booking, info, manage, start


def build_router() -> Router:
    root = Router()
    root.include_router(start.router)
    root.include_router(info.router)
    root.include_router(booking.router)
    root.include_router(manage.router)
    root.include_router(admin.router)
    return root
