import requests
import time

SERVER = "http://localhost:3000"  # Ganti jika server beda

MESIN = "D9-10"

def post(endpoint, payload):
    url = f"{SERVER}/downtime/{endpoint}"
    res = requests.post(url, json=payload)
    try:
        response_json = res.json()
    except Exception:
        response_json = res.text  # fallback: teks biasa
    print(f"📡 POST /{endpoint} | Status:", res.status_code, response_json)


# Simulasi pengiriman dari Python script:
# 1. Downtime dimulai
post("start", {
    "mesin": MESIN,
    "timestamp": "2025-08-06T10:00:00"
})

time.sleep(10)  # jeda simulasi

# 2. Perbaikan dimulai
post("repair-start", {
    "mesin": MESIN,
    "timestamp": "2025-08-06T10:10:00"
})

time.sleep(10)

# 3. Perbaikan selesai
post("finish", {
    "mesin": MESIN,
    "timestamp": "2025-08-06T10:25:00"
})
