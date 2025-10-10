# backend/main.py
import os, re
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from sqlalchemy import text
from sqlalchemy.engine import create_engine
from pydantic import BaseModel, EmailStr
from email.message import EmailMessage
import smtplib

# ---- load env first ----
load_dotenv()

DB_URL = os.environ["DATABASE_URL"]
ALLOWED = [
    o.strip() for o in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5175,http://192.168.100.134:5175", 
    ).split(",")
    if o.strip()
]

# ---- single app instance ----
app = FastAPI()

@app.get("/api/config-check")
def config_check():
    keys = ["SMTP_HOST","SMTP_PORT","SMTP_USER","SMTP_PASS","SENDER_EMAIL","RECEIVER_EMAIL"]
    present = {k: bool(os.getenv(k)) for k in keys}
    # show password length only (to catch spaces)
    pw = os.getenv("SMTP_PASS")
    present["SMTP_PASS"] = f"len={len(pw)}" if pw else False
    return present



# ---- CORS (attach ONCE) ----
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED,      # exact origins (no trailing slash)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- DB engine ----
engine = create_engine(DB_URL, pool_pre_ping=True)

# ---- helpers & routes ----
def to_local8(raw: str) -> str:
    digits = re.sub(r"\D+", "", raw)
    if digits.startswith("965"):
        digits = digits[3:]
    if len(digits) != 8:
        raise ValueError("Must be exactly 8 digits")
    return digits

@app.get("/api/health")
def health():
    with engine.begin() as conn:
        conn.execute(text("SELECT 1"))
    return {"ok": True}

@app.get("/api/patients/exists")
def patient_exists(mobile: str):
    try:
        local8 = to_local8(mobile)
    except ValueError:
        return {"exists": False}

    with engine.begin() as conn:
        row = conn.execute(
            text("SELECT 1 FROM patients WHERE mobile_num = :m LIMIT 1"),
            {"m": local8},
        ).first()
    return {"exists": bool(row)}

# ---- models ----
class SubmitRequest(BaseModel):
    full_name: str
    mobile: str
    # optional fields
    email: EmailStr | None = None
    note: str | None = None

# ---- tiny helper to sanitize headers ----
def _clean_header(s: str) -> str:
    return re.sub(r'[\r\n]+', ' ', s).strip()

# ---- email helper ----
def send_email_new_request(full_name: str, mobile_local8: str, receiver: str, reply_to: str | None = None):
    try:
        sender = os.environ["SENDER_EMAIL"]               # e.g. "Altayyeb Clinic <ayc.kwt@gmail.com>"
        host   = os.environ["SMTP_HOST"]
        port   = int(os.environ.get("SMTP_PORT", "587"))
        user   = os.environ["SMTP_USER"]                  # ayc.kwt@gmail.com
        pwd    = os.environ["SMTP_PASS"]                  # 16-char app password (no spaces)
    except KeyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Missing server configuration: {e.args[0]}"
        )

    subject = f"New Appointment Request — {_clean_header(full_name)}"

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = receiver
    if reply_to:
        msg["Reply-To"] = reply_to
    bcc = os.environ.get("BCC_EMAIL")
    if bcc:
        msg["Bcc"] = bcc

    msg.set_content(
        f"A new appointment request was submitted:\n\n"
        f"Full name: {full_name}\n"
        f"Mobile (Kuwait): {mobile_local8}\n"
        f"Submitted via website backend.\n"
    )

    try:
        with smtplib.SMTP(host=host, port=port, timeout=30) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.login(user, pwd)
            smtp.send_message(msg)
    except smtplib.SMTPAuthenticationError:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Email auth failed. Check SMTP_USER/SMTP_PASS (app password) configuration."
        )
    except (smtplib.SMTPException, OSError) as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Email delivery error: {str(e)}"
        )

# ---- route: submit request ----
@app.post("/api/submit-request")
def submit_request(payload: SubmitRequest):
    # validate mobile to exactly 8 local digits
    try:
        local8 = to_local8(payload.mobile)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Mobile must be exactly 8 digits (Kuwait)."
        )

    receiver = os.environ.get("RECEIVER_EMAIL")
    if not receiver:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Missing server configuration: RECEIVER_EMAIL"
        )

    send_email_new_request(
        full_name=payload.full_name.strip(),
        mobile_local8=local8,
        receiver=receiver,
        reply_to=(payload.email if getattr(payload, "email", None) else None)
    )

    return {"ok": True, "msg": "Request submitted and email sent"}
