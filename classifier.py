import cv2

# 검출 객체 2개 생성(얼굴 인식용 1개, 눈 인식용 1개)
faceClassifier = cv2.CascadeClassifier('./haarModels/haarcascade_frontalface_default.xml')

def classify(image):

	# 이미지를 흑백으로 바꾸고 얼굴과 눈 탐지
	image_gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
	faces = faceClassifier.detectMultiScale(image_gray)	# 얼굴 탐지

	# 노란색(0, 255, 255) 사각형으로 얼굴 표시
	numberOfPeople = 0
	for x, y, w, h in faces:
		cv2.rectangle(image, (x, y), (x + w, y + h), (0, 255, 255), 4)

	return image



