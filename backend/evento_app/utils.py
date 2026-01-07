import qrcode
from io import BytesIO
from django.core.files import File

def generate_qr_code(data, filename_prefix=None):
    """
    Generates a QR code image from the given string data.
    
    Args:
        data (str): The string to encode in the QR.
        filename_prefix (str, optional): A prefix for the filename (if needed for saving). 
                                         Currently returns the file object and exact filename.
                                         
    Returns:
        tuple: (filename, File object)
        
    """
    try:
        qr_img = qrcode.make(str(data))
        canvas = BytesIO()
        qr_img.save(canvas, format='PNG')
        canvas.seek(0)
        
        filename = f"{data}.png"
        return filename, File(canvas)
    except Exception:
        return None, None
