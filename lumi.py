import time
import RPi.GPIO as GPIO
import Adafruit_MCP3008

GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

mcp = Adafruit_MCP3008.MCP3008(clk=11, cs=8, miso=9, mosi=10)

# 채널 0에 연결된 조도센서로부터 조도값 읽기
def getLuminance():
	return mcp.read_adc(0)
