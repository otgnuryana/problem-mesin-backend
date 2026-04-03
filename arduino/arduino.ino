const int pinStart = 2;
const int pinRepair = 3;

bool sudahStart = false;
bool sudahRepair = false;

unsigned long lastChange = 0;
const int debounceDelay = 80;

bool lastStart = HIGH;
bool lastRepair = HIGH;

void setup() {
  pinMode(pinStart, INPUT_PULLUP);
  pinMode(pinRepair, INPUT_PULLUP);
  Serial.begin(9600);
}

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

    if (startAktif && repairAktif && !sudahStart) {
      Serial.println("START");
      sudahStart = true;
      sudahRepair = false;

    } else if (!startAktif && repairAktif && !sudahRepair && sudahStart) {
      Serial.println("REPAIR-START");
      sudahRepair = true;

    } else if (!startAktif && !repairAktif && (sudahStart || sudahRepair)) {
      Serial.println("FINISH");
      sudahStart = false;
      sudahRepair = false;
    }
  }

  lastStart = startNow;
  lastRepair = repairNow;

  delay(10); // dari 300 → 10 (WAJIB)
}