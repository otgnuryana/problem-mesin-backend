import serial
import requests

PORT = 'COM11'  # Ganti sesuai port Arduino kamu
BAUD = 9600
SERVER_URL = 'http://localhost:3000/downtime'  # Ganti jika server beda

def kirim_ke_server(mesin, aksi):
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
        response = requests.post(url, json={'mesin': mesin})
        print(f"📡 Kirim ke {url} => {response.status_code}, {response.text}")
    except Exception as e:
        print(f"❌ Gagal kirim request: {e}")

def baca_serial():
    try:
        ser = serial.Serial(PORT, BAUD, timeout=1)
        print(f"✅ Terhubung ke {PORT} pada {BAUD}bps")

        while True:
            line = ser.readline().decode().strip()
            if not line:
                continue

            print(f"📥 Serial masuk: {line}")

            if '|' in line:
                mesin, aksi = line.split('|', 1)
                mesin = mesin.strip()
                aksi = aksi.strip().upper()
                kirim_ke_server(mesin, aksi)
            else:
                print("⚠️ Format salah, abaikan")

    except serial.SerialException as e:
        print(f"❌ Gagal buka port serial: {e}")

if __name__ == '__main__':
    baca_serial()
