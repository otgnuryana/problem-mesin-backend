import requests
import time

SERVER = "http://localhost:3000"  # Ganti jika server beda

MESIN = "D9-10"
CARLINE = "Daihatsu"
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
    "carline": CARLINE
})

time.sleep(10)  # jeda simulasi

# 2. Perbaikan dimulai
post("repair-start", {
    "mesin": MESIN,
    "carline": CARLINE
})

time.sleep(40)

# 3. Perbaikan selesai
post("finish", {
    "mesin": MESIN,
    "carline": CARLINE
})
