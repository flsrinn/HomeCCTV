import time
import RPi.GPIO as GPIO

# pin에 연결된 LED에 value(0/1) 값을 출력하여 LED를 켜거나 끄는 함수
def ledOnOff(pin, value):
	GPIO.output(pin, value)
    
# led 번호의 핀에 on_off(0/1) 값 출력하는 함수
def controlLED(on_off): 
    GPIO.output(redLed, on_off)
    GPIO.output(greenLed, on_off)

GPIO.setmode(GPIO.BCM) # BCM 모드로 작동
GPIO.setwarnings(False) # 경고글이 출력되지 않게 설정

redLed = 6 # 빨간색 LED를GPIO6에 연결
greenLed = 13 # 초록색 LED를 GPIO13에 연결 
GPIO.setup(redLed, GPIO.OUT) # GPIO6 핀을 출력으로 지정
GPIO.setup(greenLed, GPIO.OUT) # GPIO13 핀을 출력으로 지정

