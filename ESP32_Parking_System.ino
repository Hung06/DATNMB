/*
 * ESP32 Parking System
 * Hệ thống đỗ xe thông minh với 4 slot
 * Sử dụng cảm biến siêu âm HC-SR04 và LED báo trạng thái
 */

// Định nghĩa chân GPIO cho từng slot
struct ParkingSlot {
  int trigPin;    // Chân Trig của cảm biến siêu âm
  int echoPin;    // Chân Echo của cảm biến siêu âm
  int greenLed;   // LED xanh
  int redLed;     // LED đỏ
  bool isOccupied; // Trạng thái slot (true = có xe, false = trống)
};

// Khởi tạo 4 slot đỗ xe
ParkingSlot slots[4] = {
  {4, 5, 16, 17, false},   // Slot 1
  {18, 19, 22, 23, false}, // Slot 2
  {26, 27, 32, 35, false}, // Slot 3
  {12, 13, 25, 33, false}  // Slot 4
};

// Các thông số cấu hình
const int DISTANCE_THRESHOLD = 5;  // Ngưỡng khoảng cách 5cm
const int SOUND_SPEED = 0.034;     // Tốc độ âm thanh (cm/microsecond)
const int MEASUREMENT_DELAY = 100; // Độ trễ giữa các lần đo (ms)

void setup() {
  // Khởi tạo Serial Monitor
  Serial.begin(9600);
  Serial.println("\n==========================================");
  Serial.println("    ESP32 PARKING SYSTEM");
  Serial.println("==========================================");
  Serial.println("Starting system...");
  
  // Khởi tạo các chân GPIO
  for (int i = 0; i < 4; i++) {
    pinMode(slots[i].trigPin, OUTPUT);
    pinMode(slots[i].echoPin, INPUT);
    pinMode(slots[i].greenLed, OUTPUT);
    pinMode(slots[i].redLed, OUTPUT);
    
    Serial.printf("Slot %d: Trig=GPIO%d, Echo=GPIO%d, Green=GPIO%d, Red=GPIO%d\n", 
                  i+1, slots[i].trigPin, slots[i].echoPin, slots[i].greenLed, slots[i].redLed);
  }
  
  Serial.println("All GPIO initialized");
  Serial.println("Turning ON all LEDs...");
  
  // Bật tất cả LED xanh
  Serial.println("All GREEN LEDs ON");
  for (int i = 0; i < 4; i++) {
    digitalWrite(slots[i].greenLed, HIGH);
  }
  
  // Bật tất cả LED đỏ
  Serial.println("All RED LEDs ON");
  for (int i = 0; i < 4; i++) {
    digitalWrite(slots[i].redLed, HIGH);
  }
  
  Serial.println("All LEDs are now ON!");
  Serial.println("System ready!");
  Serial.println("==========================================\n");
}

void loop() {
  // Giữ tất cả LED sáng liên tục
  for (int i = 0; i < 4; i++) {
    digitalWrite(slots[i].greenLed, HIGH);
    digitalWrite(slots[i].redLed, HIGH);
  }
  
  // Test từng cảm biến một cách đơn giản
  for (int i = 0; i < 4; i++) {
    Serial.printf("Testing Slot %d (Trig=GPIO%d, Echo=GPIO%d):\n", i+1, slots[i].trigPin, slots[i].echoPin);
    
    // Test chân Trig
    Serial.println("  Testing Trig pin...");
    digitalWrite(slots[i].trigPin, HIGH);
    delay(100);
    digitalWrite(slots[i].trigPin, LOW);
    
    // Đọc chân Echo
    Serial.println("  Reading Echo pin...");
    int echoValue = digitalRead(slots[i].echoPin);
    Serial.printf("  Echo pin value: %d\n", echoValue);
    
    // Đo khoảng cách
    float distance = measureDistance(i);
    Serial.printf("  Distance: %.1f cm\n", distance);
    
    Serial.println("  ---");
    delay(1000); // Chờ 1 giây giữa các slot
  }
  
  Serial.println("================================");
  delay(3000); // Chờ 3 giây trước khi test lại
}

// Hàm đo khoảng cách từ cảm biến siêu âm
float measureDistance(int slotIndex) {
  // Gửi xung Trig
  digitalWrite(slots[slotIndex].trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(slots[slotIndex].trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(slots[slotIndex].trigPin, LOW);
  
  // Đọc thời gian Echo với timeout
  long duration = pulseIn(slots[slotIndex].echoPin, HIGH, 30000); // 30ms timeout
  
  // Debug: in thời gian Echo
  Serial.printf("  Echo duration: %ld us", duration);
  
  // Kiểm tra timeout
  if (duration == 0) {
    Serial.println(" - TIMEOUT");
    return 999.0; // Giá trị đặc biệt để báo lỗi
  }
  
  // Tính khoảng cách
  float distance = duration * SOUND_SPEED / 2;
  
  // Giới hạn khoảng cách hợp lý (0-400cm)
  if (distance > 400 || distance < 0) {
    Serial.println(" - OUT OF RANGE");
    return 999.0;
  }
  
  Serial.println(""); // Xuống dòng
  return distance;
}

// Hàm cập nhật LED cho slot
void updateSlotLEDs(int slotIndex) {
  if (slots[slotIndex].isOccupied) {
    // Có xe: LED đỏ sáng, LED xanh tắt
    digitalWrite(slots[slotIndex].redLed, HIGH);
    digitalWrite(slots[slotIndex].greenLed, LOW);
  } else {
    // Trống: LED xanh sáng, LED đỏ tắt
    digitalWrite(slots[slotIndex].greenLed, HIGH);
    digitalWrite(slots[slotIndex].redLed, LOW);
  }
}

// Hàm in trạng thái tổng quan hệ thống
void printSystemStatus() {
  Serial.println("\n=== SYSTEM STATUS ===");
  int occupiedSlots = 0;
  
  for (int i = 0; i < 4; i++) {
    if (slots[i].isOccupied) {
      Serial.printf("  Slot %d: OCCUPIED\n", i+1);
      occupiedSlots++;
    } else {
      Serial.printf("  Slot %d: EMPTY\n", i+1);
    }
  }
  
  Serial.println("  ─────────────────────────────");
  Serial.printf("  Total: %d/4 slots occupied\n", occupiedSlots);
  Serial.printf("  Usage: %d%%\n", (occupiedSlots * 25));
  Serial.println("==============================\n");
}

// Hàm test LED (có thể gọi từ Serial Monitor)
void testLEDs() {
  Serial.println("\n=== LED TEST ===");
  Serial.println("Testing all LEDs...");
  
  // Test LED xanh
  Serial.println("  Testing GREEN LEDs...");
  for (int i = 0; i < 4; i++) {
    digitalWrite(slots[i].greenLed, HIGH);
  }
  delay(1000);
  
  for (int i = 0; i < 4; i++) {
    digitalWrite(slots[i].greenLed, LOW);
  }
  
  // Test LED đỏ
  Serial.println("  Testing RED LEDs...");
  for (int i = 0; i < 4; i++) {
    digitalWrite(slots[i].redLed, HIGH);
  }
  delay(1000);
  
  for (int i = 0; i < 4; i++) {
    digitalWrite(slots[i].redLed, LOW);
  }
  
  Serial.println("  LED test completed!");
  Serial.println("==============================\n");
}
