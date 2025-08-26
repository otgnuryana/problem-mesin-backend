import serial
import requests

PORT = 'COM11'   # Ganti sesuai port Arduino
BAUD = 9600
SERVER_URL = 'http://localhost:3000/downtime'  # Alamat server

MESIN = 'D9-10'       # Nama mesin
CARLINE = 'Daihatsu'  # Area Carline

def kirim_ke_server(aksi):
    endpoint_map = {
        'START': 'start',
        'REPAIR-START': 'repair-start',
        'FINISH': 'finish'
    }

    if aksi not in endpoint_map:
        print(f"⚠️ Aksi tidak dikenali: {aksi}")
        return

    try:
        url = f"{SERVER_URL}/{endpoint_map[aksi]}"
        payload = {
            'mesin': MESIN,
            'carline': CARLINE
        }
        response = requests.post(url, json=payload)
        print(f"📡 Kirim ke {url} => {response.status_code}, {response.text}")
    except Exception as e:
        print(f"❌ Gagal kirim request: {e}")

def baca_serial():
    try:
        ser = serial.Serial(PORT, BAUD, timeout=1)
        print(f"✅ Terhubung ke {PORT} pada {BAUD}bps (mesin: {MESIN}, carline: {CARLINE})")

        while True:
            line = ser.readline().decode().strip()
            if not line:
                continue

            print(f"📥 Serial masuk: {line}")
            kirim_ke_server(line.upper())

    except serial.SerialException as e:
        print(f"❌ Gagal buka port serial: {e}")

if __name__ == '__main__':
    baca_serial()
