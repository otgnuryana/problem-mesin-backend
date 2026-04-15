const int pinStart = 2;
const int pinRepair = 3;

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
  Serial.begin(9600);
}

// ===== FUNCTION KIRIM =====
void kirim(String msg) {
  if (millis() - lastSend > sendDelay) {
    Serial.println(msg);
    lastSend = millis();
  }
}

// ===== LOOP =====
void loop() {
  bool startNow = digitalRead(pinStart);
  bool repairNow = digitalRead(pinRepair);

  // debounce detect perubahan
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