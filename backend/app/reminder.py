import asyncio
from datetime import datetime, timezone
import smtplib
from email.message import EmailMessage
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload

from .core.config import settings
from .models import Note, User


async def send_email(to_email: str, subject: str, body: str):
    if not all([settings.smtp_host, settings.smtp_port, settings.smtp_user, settings.smtp_password, settings.smtp_from]):
        return

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = settings.smtp_from
    msg["To"] = to_email
    msg.set_content(body)

    # Use sync SMTP in thread to avoid blocking event loop
    def _send():
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(msg)

    await asyncio.to_thread(_send)


async def reminder_worker(async_session_factory):
    """Background worker to send reminder emails."""
    while True:
        try:
            async with async_session_factory() as session:
                now = datetime.now(timezone.utc)
                result = await session.execute(
                    select(Note)
                    .join(User)
                    .where(
                        Note.reminder_at.is_not(None),
                        Note.reminder_sent.is_(False),
                        Note.reminder_at <= now,
                        Note.deleted_at.is_(None),
                    )
                    .options(selectinload(Note.owner))
                )
                notes = result.scalars().all()

                for note in notes:
                    user_email = note.owner.email if note.owner else None
                    if not user_email:
                        continue
                    await send_email(
                        user_email,
                        subject=f"Nhắc nhở ghi chú: {note.title}",
                        body=f"Bạn có ghi chú cần chú ý: '{note.title}'\n\nNội dung:\n{note.content or '(không có nội dung)'}",
                    )
                    await session.execute(
                        update(Note).where(Note.id == note.id).values(reminder_sent=True)
                    )
                await session.commit()
        except Exception:
            # Không cho worker chết vì lỗi; log ra stdout
            import traceback

            traceback.print_exc()
        await asyncio.sleep(60)

