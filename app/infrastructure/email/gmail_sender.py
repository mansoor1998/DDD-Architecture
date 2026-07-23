import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.domain.interfaces.email_interface import IEmailSender
from app.core import settings


class GmailEmailSender(IEmailSender):
    async def send_verification_email(self, email: str, token: str) -> None:
        verification_url = f"http://localhost:8000/api/v1/verify-email?token={token}"

        message = MIMEMultipart()
        message["From"] = settings.SMTP_USERNAME
        message["To"] = email
        message["Subject"] = "Verify your email - Todo App"

        body = (
            f"Please click the following link to verify your email: {verification_url}"
        )
        message.attach(MIMEText(body, "plain"))

        try:
            # Running smtplib in an async context is tricky,
            # for a test app we can use the sync version or run it in a thread.
            with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
                server.send_message(message)
        except Exception as e:
            # For a real app, you'd log this and handle it properly.
            print(f"Error sending email: {e}")
            raise e
