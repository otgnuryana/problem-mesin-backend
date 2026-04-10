import serial
import requests
import time

PORT = 'COM11'
BAUD = 9600
SERVER_URL = 'http://10.62.184.181:3000/downtime'

MESIN = 'T9-10'
CARLINE = 'Toyota'

# ===== Logging =====
def log(msg):
    t = time.strftime("%Y-%m-%d %H:%M:%S")
    with open("log.txt", "a") as f:
        f.write(f"[{t}] {msg}\n")

# ===== Kirim ke server =====
def kirim_ke_server(aksi):
    endpoint_map = {
        'START': 'start',
        'REPAIR-START': 'repair-start',
        'FINISH': 'finish'
    }

    if aksi not in endpoint_map:
        log(f"⚠️ Aksi tidak dikenali: {aksi}")
        return

    try:
        url = f"{SERVER_URL}/{endpoint_map[aksi]}"
        payload = {
            'mesin': MESIN,
            'carline': CARLINE
        }

        res = requests.post(url, json=payload, timeout=5)
        log(f"📡 {aksi} => {res.status_code}")

    except Exception as e:
        log(f"❌ Gagal kirim: {e}")

# ===== Baca serial NON-BLOCKING =====
def baca_serial():
    buffer = ""

    while True:
        try:
            log("🔄 Mencoba koneksi serial...")
            ser = serial.Serial(PORT, BAUD, timeout=0)
            ser.reset_input_buffer()
            log("✅ Serial connected")

            while True:
                try:
                    if ser.in_waiting > 0:
                        data = ser.read(ser.in_waiting).decode(errors='ignore')
                        buffer += data

                        if '\n' in buffer:
                            lines = buffer.split('\n')

                            for line in lines[:-1]:
                                line = line.strip()
                                if line:
                                    log(f"📥 {line}")
                                    kirim_ke_server(line.upper())

                            buffer = lines[-1]

                    time.sleep(0.01)

                except Exception as e:
                    log(f"⚠️ Error saat baca serial: {e}")
                    break  # keluar loop dalam → reconnect

        except Exception as e:
            log(f"❌ Gagal connect serial: {e}")

        log("⏳ Retry 3 detik...")
        time.sleep(3)

# ===== MAIN =====
if __name__ == '__main__':
    while True:
        try:
            baca_serial()
        except Exception as e:
            log(f"🔥 FATAL ERROR: {e}")
            time.sleep(5)