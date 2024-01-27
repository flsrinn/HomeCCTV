import io, time
import paho.mqtt.client as mqtt
import control
import base64
import lumi
import temp
import led

# 값을 불러올 전역 변수
isStart = False 

def on_connect(client, userdata, flag, rc):
	client.subscribe("led", qos = 0) # "led" 토픽으로 구독 신청

def on_message(client, userdata, msg) :
    global isStart
    # 'start'라는 메세지를 받을 경우 isStart를 true로 설정
    if msg.payload.decode('utf-8') == 'start':
        isStart = True
    # 'stop'라는 메세지를 받을 경우 isStart를 false 설정
    elif msg.payload.decode('utf-8') == 'stop':
        isStart = False
    # 1이나 0 메세지를 받을 경우
    elif int(msg.payload) == 1 or int(msg.payload) == 0:
        led.controlLED(int(msg.payload)) # LED를 켜거나 끔

ip = "localhost" # 현재 브로커는 이 컴퓨터에 설치되어 있음

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.connect(ip, 1883) # 브로커에 연결
client.loop_start() # 메시지 루프를 실행하는 스레드 생성
# 도착하는 메시지는 on_message() 함수에 의해 처리되어 LED를 켜거나 끄는 작업과
# 병렬적으로 1초 단위로 초음파 센서로부터 거리를 읽어 전송하는 무한 루프 실행
while True:
    if isStart == True:
        distance = control.measure_distance() # 초음파 센서로부터 거리 읽기
        client.publish("ultrasonic", distance, qos=0) # “ultrasonic" 토픽으로 거리 전송
        luminance = lumi.getLuminance() # 조도 센서로부터 조도 읽기
        client.publish("luminance", luminance, qos=0) # "luminance" 토픽으로 조도 전송
        temperature = temp.getTemperature(temp.sensor) # 온습도 센서로부터 온도 읽기
        client.publish("temperature", temperature, qos=0) # "temperature" 토픽으로 온도 전송
        humidity = temp.getHumidity(temp.sensor) # 온습도 센서로부터 습도 읽기
        client.publish("humidity", humidity, qos=0) # "humidity" 토픽으로 습도 전송
	
        # 거리가 30cm 이하일 경우 빨간색 LED를 킴
        if(distance <= 30):
            led.ledOnOff(led.redLed, 1)
            led.ledOnOff(led.greenLed, 0)
        # 30cm보다 멀리 있으면 초록색 LED를 킴
        else :
            led.ledOnOff(led.redLed, 0)
            led.ledOnOff(led.greenLed, 1)
        time.sleep(1) # 1초 동안 잠자기
client.loop_stop() # 메시지 루프를 실행하는 스레드 종료
client.disconnect()


