let client = null; // MQTT 클라이언트의 역할을 하는 Client 객체를 가리키는 전역변수
let connectionFlag = false; // 연결 상태이면 true
const CLIENT_ID = "client-"+Math.floor((1+Math.random())*0x10000000000).toString(16) // 사용자 ID 랜덤 생성

function connect() { // 브로커에 접속하는 함수
	if(connectionFlag == true)
		return; // 현재 연결 상태이므로 다시 연결하지 않음
	// 사용자가 입력한 브로커의 IP 주소와 포트 번호 알아내기
	let broker = document.getElementById("broker").value; // 브로커의 IP 주소
	let port = 9001 // mosquitto를 웹소켓으로 접속할 포트 번호

	// MQTT 메시지 전송 기능을 모두 가징 Paho client 객체 생성
	client = new Paho.MQTT.Client(broker, Number(port), CLIENT_ID);

	// client 객체에 콜백 함수 등록 및 연결
	client.onConnectionLost = onConnectionLost; // 접속 끊김 시 onConnectLost() 실행 
	client.onMessageArrived = onMessageArrived; // 메시지 도착 시 onMessageArrived() 실행
	
	// client 객체에게 브로커에 접속 지시
	client.connect({
		onSuccess:onConnect, // 브로커로부터 접속 응답 시 onConnect() 실행
	});
}

// 브로커로의 접속이 성공할 때 호출되는 함수
function onConnect() {
	document.getElementById("messages").innerHTML = '<span><b>CCTV와 연결</b>되었습니다.' + '</span><br/>';
	connectionFlag = true; // 연결 상태로 설정
}

function subscribe(topic) {
	if(connectionFlag != true) { // 연결되지 않은 경우
		alert("연결되지 않았음");
		return false;
	}

	// 구독 신청하였음을 <div> 영역에 출력
	document.getElementById("messages").innerHTML = '<span><b>CCTV 작동</b>을 <b>시작</b>합니다.</span><br/>';
	client.subscribe(topic); // 브로커에 구독 신청
    client.subscribe("temperature");
    client.subscribe("luminance");
    client.subscribe("humidity");
    client.send("led", "start", 0, false);
}
function publish(topic, msg) {
	if(connectionFlag != true) { // 연결되지 않은 경우
		alert("연결되지 않았음");
		return false;
	}
	client.send(topic, msg, 0, false);
	return true;
}

function unsubscribe(topic) {
	if(connectionFlag != true) return; // 연결되지 않은 경우
	// 구독 신청 취소를 <div> 영역에 출력
	document.getElementById("messages").innerHTML = '<span><b>CCTV 작동</b>을 <b>중단</b>합니다.</span><br>';
    document.getElementById("childInfo").innerHTML = "";
	client.unsubscribe(topic); // 브로커에 구독 신청 취소
    client.unsubscribe("luminance");
    client.unsubscribe("temperature"); 
    client.unsubscribe("humidity");
    client.send('led', '0', 0, false);
    client.send('led', 'stop', 0, false);
    client.send('camera', 'stop', 0, false);
    clear(); clear();
}

// 접속이 끊어졌을 때 호출되는 함수
function onConnectionLost(responseObject) { // responseObject는 응답 패킷
	//document.getElementById("messages").innerHTML = '<span><b>오류</b> : 접속 끊어짐</span><br/>';
	if (responseObject.errorCode !== 0) {
		document.getElementById("messages").innerHTML = '<span>오류 : ' + 
				responseObject.errorMessage + '</span><br/>';
	}
	connectionFlag = false; // 연결 되지 않은 상태로 설정
}

// 메시지가 도착할 때 호출되는 함수
function onMessageArrived(msg) { // 매개변수 msg는 도착한 MQTT 메시지를 담고 있는 객체
	// 도착한 메시지 출력. mqttio3.js의 다음 코드 수정
    if(msg.destinationName == "ultrasonic"){
        let distance = parseInt(msg.payloadString);
        if(distance <= 30) {
            startCamera();
            document.getElementById("childInfo").innerHTML = "<span>아이가<b> 위험</b>합니다!</span>";
        }
        else {
            stopCamera();
            document.getElementById("childInfo").innerHTML = "<span>아이는 <b>안전</b>합니다.</span>";
        }
        addChartData(parseFloat(msg.payloadString)); 
    }
    else if(msg.destinationName == "temperature"){
        let temp = parseInt(msg.payloadString);
        let tempImg = document.getElementById('tempImg');
        if(temp >= 28)
            tempImg.src = "static/hot.png";
        else if(temp <= 18)
            tempImg.src = "static/cold.png";
        else
            tempImg.src = "static/averagetemp.png";
        tempImg.title = '온도: ' + temp;
    }
    else if(msg.destinationName == "luminance"){
        let lumi = parseInt(msg.payloadString);
        let lumiImg = document.getElementById('lumiImg');
        if(lumi <= 60)
            lumiImg.src = "static/moon.png";
        else
            lumiImg.src = "static/sun.png";
        lumiImg.title = '밝기: ' + lumi;
    }
    else if(msg.destinationName == "humidity"){
        let humid = parseInt(msg.payloadString);
        let humidImg = document.getElementById('humidImg');
        if(humid >= 60)
            humidImg.src = "static/humid.png";
        else if(humid <= 40)
            humidImg.src = "static/lowhumid.png";
		else
			humidImg.src = "static/averagehumid.png";
        humidImg.title = '습도: ' + humid;
    }
	else if(msg.destinationName == "image") {
        drawImage(msg.payloadBytes); // 메시지에 담긴 파일 이름으로 drawImage() 호출. drawImage()는 웹 페이지에 있음
    }
}

// disconnection 버튼이 선택되었을 때 호출되는 함수
function disconnect() {
	if(connectionFlag == false) 
		return; // 연결 되지 않은 상태이면 그냥 理턴
    document.getElementById("messages").innerHTML = '<span><b>CCTV 연결</b>을 <b>종료</b>합니다.</span><br>';
	document.getElementById("childInfo").innerHTML = "";
    connectionFlag = false; // 연결 되지 않은 상태로 설정
	client.send('led', "0", 0, false); // led를 끄도록 메시지 전송
    client.send('led', "stop", 0, false);
    clear();
	client.disconnect(); // 브로커와 접속 해제
	client.unsubscribe('led');
}
