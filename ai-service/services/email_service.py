import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import aiosmtplib

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "Docuflow AI")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", SMTP_USER)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


async def _send(to_email: str, subject: str, html: str) -> None:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{SMTP_FROM_NAME} <{SMTP_FROM_EMAIL}>"
    msg["To"] = to_email
    msg.attach(MIMEText(html, "html"))

    await aiosmtplib.send(
        msg,
        hostname=SMTP_HOST,
        port=SMTP_PORT,
        username=SMTP_USER,
        password=SMTP_PASSWORD,
        start_tls=True,
    )


def _base_template(title: str, body_html: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:40px 0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
    <div style="background:#714B67;padding:32px 40px;">
      <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:900;letter-spacing:-0.5px;">DocuFlow AI</h1>
      <p style="color:rgba(255,255,255,0.6);margin:4px 0 0;font-size:13px;">{title}</p>
    </div>
    <div style="padding:40px;">
      {body_html}
      <hr style="border:none;border-top:1px solid #eeeeee;margin:32px 0 20px;">
      <p style="color:#bbbbbb;font-size:12px;margin:0;line-height:1.5;">
        This email was sent by DocuFlow AI. If you did not request this, please ignore it.
      </p>
    </div>
  </div>
</body>
</html>"""


async def send_verification_email(to_email: str, name: str, token: str) -> None:
    verify_url = f"{FRONTEND_URL}/verify-email?token={token}"
    body = f"""
      <h2 style="color:#1a1a1a;font-size:20px;margin:0 0 12px;font-weight:900;">Verify your email address</h2>
      <p style="color:#555555;line-height:1.7;margin:0 0 8px;">Hi {name},</p>
      <p style="color:#555555;line-height:1.7;margin:0 0 28px;">
        Thanks for signing up! Please click the button below to verify your email address and activate your account.
        This link expires in <strong>24 hours</strong>.
      </p>
      <a href="{verify_url}"
         style="display:inline-block;background:#714B67;color:#ffffff;text-decoration:none;
                padding:14px 32px;border-radius:10px;font-weight:700;font-size:14px;letter-spacing:0.2px;">
        Verify Email Address
      </a>
      <p style="color:#999999;font-size:13px;margin:24px 0 0;line-height:1.6;">
        Or copy and paste this link into your browser:<br>
        <a href="{verify_url}" style="color:#714B67;word-break:break-all;">{verify_url}</a>
      </p>"""
    await _send(to_email, "Verify your DocuFlow AI account", _base_template("Email Verification", body))


async def send_document_shared_email(
    to_email: str, doc_title: str, sender_name: str, company_name: str, share_url: str
) -> None:
    body = f"""
      <h2 style="color:#1a1a1a;font-size:20px;margin:0 0 12px;font-weight:900;">
        {sender_name} shared a document with you
      </h2>
      <p style="color:#555555;line-height:1.7;margin:0 0 8px;">
        <strong>{company_name}</strong> has shared the following document with you:
      </p>
      <div style="background:#f9f9f9;border-left:4px solid #714B67;padding:14px 20px;border-radius:6px;margin:0 0 28px;">
        <p style="margin:0;font-weight:700;color:#1a1a1a;">{doc_title}</p>
      </div>
      <a href="{share_url}"
         style="display:inline-block;background:#714B67;color:#ffffff;text-decoration:none;
                padding:14px 32px;border-radius:10px;font-weight:700;font-size:14px;">
        View Document
      </a>
      <p style="color:#999999;font-size:13px;margin:24px 0 0;line-height:1.6;">
        Or copy this link:<br>
        <a href="{share_url}" style="color:#714B67;word-break:break-all;">{share_url}</a>
      </p>"""
    await _send(
        to_email,
        f"{sender_name} shared '{doc_title}' with you",
        _base_template("Document Shared", body),
    )


async def send_esign_notification(
    to_email: str, signer_name: str, doc_title: str, doc_url: str
) -> None:
    body = f"""
      <h2 style="color:#1a1a1a;font-size:20px;margin:0 0 12px;font-weight:900;">Document Signed!</h2>
      <p style="color:#555555;line-height:1.7;margin:0 0 8px;">Great news — your document has been e-signed.</p>
      <div style="background:#f9f9f9;border-left:4px solid #714B67;padding:14px 20px;border-radius:6px;margin:0 0 28px;">
        <p style="margin:0;font-weight:700;color:#1a1a1a;">{doc_title}</p>
        <p style="margin:4px 0 0;color:#555555;font-size:13px;">Signed by: <strong>{signer_name}</strong></p>
      </div>
      <a href="{doc_url}"
         style="display:inline-block;background:#714B67;color:#ffffff;text-decoration:none;
                padding:14px 32px;border-radius:10px;font-weight:700;font-size:14px;">
        View Signed Document
      </a>"""
    await _send(
        to_email,
        f"✍️ {signer_name} signed '{doc_title}'",
        _base_template("E-Signature Received", body),
    )


async def send_team_invite_email(
    to_email: str, company_name: str, invite_url: str, inviter_name: str
) -> None:
    body = f"""
      <h2 style="color:#1a1a1a;font-size:20px;margin:0 0 12px;font-weight:900;">
        You're invited to join {company_name}!
      </h2>
      <p style="color:#555555;line-height:1.7;margin:0 0 28px;">
        <strong>{inviter_name}</strong> has invited you to collaborate on DocuFlow AI.
        Click the button below to create your account and join the workspace.
      </p>
      <a href="{invite_url}"
         style="display:inline-block;background:#714B67;color:#ffffff;text-decoration:none;
                padding:14px 32px;border-radius:10px;font-weight:700;font-size:14px;">
        Accept Invitation
      </a>
      <p style="color:#999999;font-size:13px;margin:24px 0 0;line-height:1.6;">
        Or copy this link:<br>
        <a href="{invite_url}" style="color:#714B67;word-break:break-all;">{invite_url}</a>
      </p>"""
    await _send(
        to_email,
        f"You're invited to join {company_name} on DocuFlow AI",
        _base_template("Team Invitation", body),
    )


async def send_password_reset_email(to_email: str, token: str) -> None:
    reset_url = f"{FRONTEND_URL}/reset-password?token={token}"
    body = f"""
      <h2 style="color:#1a1a1a;font-size:20px;margin:0 0 12px;font-weight:900;">Reset your password</h2>
      <p style="color:#555555;line-height:1.7;margin:0 0 28px;">
        We received a request to reset the password for your DocuFlow AI account.
        Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.
      </p>
      <a href="{reset_url}"
         style="display:inline-block;background:#714B67;color:#ffffff;text-decoration:none;
                padding:14px 32px;border-radius:10px;font-weight:700;font-size:14px;letter-spacing:0.2px;">
        Reset Password
      </a>
      <p style="color:#999999;font-size:13px;margin:24px 0 0;line-height:1.6;">
        If you didn't request a password reset, you can safely ignore this email — your password will remain unchanged.<br><br>
        Or copy and paste this link:<br>
        <a href="{reset_url}" style="color:#714B67;word-break:break-all;">{reset_url}</a>
      </p>"""
    await _send(to_email, "Reset your DocuFlow AI password", _base_template("Password Reset", body))
