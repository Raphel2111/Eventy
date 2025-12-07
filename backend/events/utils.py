from io import BytesIO


def generate_ticket_pdf_bytes(registration):
    """Return PDF bytes for a registration (includes QR).

    Imports reportlab lazily so Django commands don't fail if reportlab is not installed yet.
    """
    try:
        from reportlab.pdfgen import canvas
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.utils import ImageReader
    except Exception as e:
        raise

    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # Title
    c.setFont('Helvetica-Bold', 20)
    c.drawString(72, height - 72, f'Ticket: {registration.event.name}')

    # Event details
    c.setFont('Helvetica', 12)
    c.drawString(72, height - 110, f'Date: {registration.event.date}')
    c.drawString(72, height - 130, f'Location: {registration.event.location}')
    c.drawString(72, height - 150, f'Holder: {registration.user.username} ({registration.user.email})')
    c.drawString(72, height - 170, f'Entry code: {registration.entry_code}')

    # Try to get QR image
    img_reader = None
    try:
        if registration.qr_code and registration.qr_code.storage:
            registration.qr_code.open()
            img_reader = ImageReader(registration.qr_code)
    except Exception:
        img_reader = None

    if not img_reader:
        try:
            import qrcode
            qr_img = qrcode.make(str(registration.entry_code))
            qr_buf = BytesIO()
            qr_img.save(qr_buf, format='PNG')
            qr_buf.seek(0)
            img_reader = ImageReader(qr_buf)
        except Exception:
            img_reader = None

    if img_reader:
        img_w = 200
        img_h = 200
        x = 72
        y = height - 420
        c.drawImage(img_reader, x, y, width=img_w, height=img_h)

    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer.read()
