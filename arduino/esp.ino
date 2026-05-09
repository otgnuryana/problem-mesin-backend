#include <WiFi.h>
#include <HTTPClient.h>

// ===== WIFI =====
const char* ssid = "mtc";
const char* password = "00000000";

// ===== SERVER =====
const char* serverUrl = "http://10.62.184.181:3000/downtime";

// ===== DATA MESIN =====
String mesin = "T9-10";
String carline = "Toyota";

// ===== PIN =====
const int pinStart = 18;
const int pinRepair = 19;

// ===== STATE =====
enum State {
  IDLE,
  STARTED,
  REPAIR
};

State currentState = IDLE;

// ===== DEBOUNCE =====
bool lastStart = HIGH;
bool lastRepair = HIGH;

unsigned long lastChange = 0;
const int debounceDelay = 80;

// ===== ANTI SPAM =====
unsigned long lastSend = 0;
const int sendDelay = 300;

// ===== SETUP =====
void setup() {

  pinMode(pinStart, INPUT_PULLUP);
  pinMode(pinRepair, INPUT_PULLUP);

  Serial.begin(115200);

  // CONNECT WIFI
  WiFi.begin(ssid, password);

  Serial.print("Connecting WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi Connected");
  Serial.println(WiFi.localIP());
}

// ===== KIRIM KE SERVER =====
void kirim(String aksi) {

  if (millis() - lastSend < sendDelay) return;

  if (WiFi.status() == WL_CONNECTED) {

    HTTPClient http;

    String endpoint = "";

    if (aksi == "START") {
      endpoint = "/start";
    }
    else if (aksi == "REPAIR-START") {
      endpoint = "/repair-start";
    }
    else if (aksi == "FINISH") {
      endpoint = "/finish";
    }

    String url = String(serverUrl) + endpoint;

    http.begin(url);

    http.addHeader("Content-Type", "application/json");

    String json =
      "{"
      "\"mesin\":\"" + mesin + "\","
      "\"carline\":\"" + carline + "\""
      "}";

    int httpCode = http.POST(json);

    Serial.println("================================");
    Serial.println(aksi);
    Serial.println(url);
    Serial.println(json);
    Serial.print("HTTP: ");
    Serial.println(httpCode);

    http.end();

    lastSend = millis();
  }
}

// ===== LOOP =====
void loop() {

  bool startNow = digitalRead(pinStart);
  bool repairNow = digitalRead(pinRepair);

  // ===== DEBOUNCE =====
  if (startNow != lastStart || repairNow != lastRepair) {
    lastChange = millis();
  }

  if ((millis() - lastChange) > debounceDelay) {

    bool startAktif = startNow == LOW;
    bool repairAktif = repairNow == LOW;

    // ===== STATE MACHINE =====
    switch (currentState) {

      case IDLE:

        if (startAktif && repairAktif) {

          kirim("START");

          currentState = STARTED;
        }

        break;

      case STARTED:

        if (!startAktif && repairAktif) {

          kirim("REPAIR-START");

          currentState = REPAIR;
        }

        else if (!startAktif && !repairAktif) {

          kirim("FINISH");

          currentState = IDLE;
        }

        break;

      case REPAIR:

        if (!startAktif && !repairAktif) {

          kirim("FINISH");

          currentState = IDLE;
        }

        break;
    }
  }

  lastStart = startNow;
  lastRepair = repairNow;

  delay(10);
}