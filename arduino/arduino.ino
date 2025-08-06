const int pinA = 2;
const int pinB = 3;
String mesin = "D9-10";

int lastState = 0;

void setup() {
  Serial.begin(9600);
  pinMode(pinA, INPUT_PULLUP);
  pinMode(pinB, INPUT_PULLUP);
}

void loop() {
  bool a = !digitalRead(pinA); // HIGH jika terhubung ke GND
  bool b = !digitalRead(pinB);

  if (a && b && lastState != 1) {
    Serial.println(mesin + ":START");
    lastState = 1;
  } else if (!a && b && lastState != 2) {
    Serial.println(mesin + ":REPAIR");
    lastState = 2;
  } else if (!a && !b && lastState != 0) {
    Serial.println(mesin + ":FINISH");
    lastState = 0;
  }

  delay(100);
}
