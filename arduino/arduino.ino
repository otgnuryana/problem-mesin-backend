const int pinA = 2;  // tombol merah (START)
const int pinB = 3;  // tombol flasher (REPAIR)

String mesin = "D9-10";

enum State { IDLE, START, REPAIR };
State lastState = IDLE;

void setup() {
  Serial.begin(9600);
  pinMode(pinA, INPUT_PULLUP);  // logika terbalik
  pinMode(pinB, INPUT_PULLUP);
}

void loop() {
  bool a = !digitalRead(pinA);  // aktif jika LOW karena pullup
  bool b = !digitalRead(pinB);

  if (a && b && lastState != START) {
    Serial.println(mesin + ":START");
    lastState = START;
  }
  else if (!a && b && lastState != REPAIR) {
    Serial.println(mesin + ":REPAIR");
    lastState = REPAIR;
  }
  else if (!a && !b && lastState != IDLE) {
    Serial.println(mesin + ":FINISH");
    lastState = IDLE;
  }

  delay(100); // debouncing & anti spam
}
