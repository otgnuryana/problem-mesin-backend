const int pinStart = 2;
const int pinRepair = 3;

bool sudahStart = false;
bool sudahRepair = false;


void setup() {
  pinMode(pinStart, INPUT_PULLUP);
  pinMode(pinRepair, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop() {
  bool startAktif = digitalRead(pinStart) == LOW;
  bool repairAktif = digitalRead(pinRepair) == LOW;

  if (startAktif && repairAktif && !sudahStart) {
    Serial.println("|START");
    sudahStart = true;
    sudahRepair = false;
  } else if (!startAktif && repairAktif && !sudahRepair) {
    Serial.println("|REPAIR-START");
    sudahRepair = true;
  } else if (!startAktif && !repairAktif && (sudahStart || sudahRepair)) {
    Serial.println("|FINISH");
    sudahStart = false;
    sudahRepair = false;
  }

  delay(300);
}
