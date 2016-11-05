/**************************************************
** GAME VARIABLES
**************************************************/
var canvas, ctx, socket, drawCache = [], connection, xoff = 0, yoff = 0, isChatFaded = true, typing = false, clearNext = false, debug = false, reseting = false, connected = false;


/**************************************************
** GAME INITIALISATION
**************************************************/
function init() {
	if(!connected){
		// Declare the canvas and rendering context
		canvas = document.getElementById("gameCanvas");
		ctx = canvas.getContext("2d");
		drawCache = [];
		// Maximise the canvas
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		// Calculate a random start position for the local player
		// The minus 5 (half a player size) stops the player being
		// placed right on the egde of the screen
		// placed right on the egde of the screen

		// Initialise the local player
		window.WebSocket = window.WebSocket || window.MozWebSocket;
		connectToServer();
		// Start listening for events
	}
};

function sendChatMessage(){
	var msg = document.forms["chatForm"]["msg"].value;
	if(connected&&msg.length>0){
		connection.send("6|"+msg+"|0");
	}
	toggleChatBox();
	document.forms["chatForm"]["msg"].value="";
	return false;
}

function toggleChatBox(){
	toggleMessages();
	toggleChatInput();
}

function toggleMessages(){
	if(isChatFaded)
		$("#chatbox").fadeTo("fast",1);
	else
		$("#chatbox").fadeTo("fast",0.50);

	isChatFaded=!isChatFaded;
}

function toggleChatInput(){
	typing=!typing;
	if(!isChatFaded)
		$("#enterMessage").fadeTo("fast",1);
	else
		$("#enterMessage").fadeTo("fast",0);
	
	if(typing){
		$("#msgBox").focus();
	}
}

function connectToServer(){
	canvas = document.getElementById("gameCanvas");
	ctx = canvas.getContext("2d");
	drawCache = [];
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	var connectTo = "wss://gsv.gocode.it:5453";
	connection = new WebSocket(connectTo);
	
    connection.onopen = function () {
        connection.send("0|"+username+"|"+password);
    };
	
	connection.onclose = function (code , message){
		console.log("I was disconnected! "+message);
		drawCache=[];
		connected=false;
		unHideMenu();
		if(!isChatFaded){
			toggleChatBox();
		}
		$("#chatbox").fadeTo("fast",0);
		$("#chatbox").text("");
	}
    connection.onerror = function (error) {
        console.log("ERR : ");
		console.log(error);
    };
	connection.onmessage = function (message) {
		rdata = message.data;
		if(debug)console.log(rdata);
		var data = rdata.split("|");
		var type = parseInt(data[0]);
		switch(type){
			case 0 :
				handshake = parseInt(data[1]);
				connection.send("3|"+ handshake);
				connection.send("4|"+canvas.width+"|"+canvas.height);
				connected=true;
				animate();
				$("#chatbox").fadeTo("slow",0.50);
				HideMenu();
				break;
			case 1: 
				console.log(data[1]);
				$("#chatbox").append(data[1]+"\n");
				var textarea = document.getElementById('chatbox');
				textarea.scrollTop = textarea.scrollHeight;
				break;
			case 2:
				drawCache=[];console.log("CLEARED");
				//{type, x, y, color, {extra data (ex: x2,y2 for type 0 | text for type 1. text size | isSelf for type 2)}}
				var subData = rdata.split("~");
				console.log(rdata);
				for(var i=0;i<subData.length;i++){
					if(subData[i]){
						var ddata = subData[i].split("|");
						if(ddata[1]=="0"){
							xoff=parseInt(subData[0].split("|")[2]);
							yoff=parseInt(subData[0].split("|")[3]);
						}else{
							var extras = ddata[6].split("§");
							drawCache[ddata[1]]=[ddata[2],ddata[3],ddata[4],ddata[5],extras];
						}
					}
				}
				//Fix Positions by the new xoff&yoff
				break;
			case 3: 
				//{type, x, y, color, {extra data (ex: x2,y2 for type 0 | text for type 1. text size | isSelf for type 2)}}
				var subData = rdata.split("~");
				console.log(rdata);
				for(var i=0;i<subData.length;i++){
					if(subData[i]){
						var ddata = subData[i].split("|");
						if(ddata[2]=="9"){delete drawCache[ddata[1]];continue;}
						if(ddata[1]=="0"){
							xoff=parseInt(subData[0].split("|")[2]);
							yoff=parseInt(subData[0].split("|")[3]);
						}else{
							var extras = ddata[6].split("§");
							drawCache[ddata[1]]=[ddata[2],ddata[3],ddata[4],ddata[5],extras];
						}
					}
				}
				//Fix Positions by the new xoff&yoff
				break;
			case 4://HeartBeat
				connection.send("7|");
				break;
			default :
				console.log("Invalid packet recieved! "+type);
				break;
		}
    };
}

/**************************************************
** GAME EVENT HANDLERS
**************************************************/
var setEventHandlers = function() {
	// Keys
	$(document).keydown(onKeydown);
	window.addEventListener("keyup", onKeyup, false);
	
	// Mouse
	$(document).contextmenu(onCM);
	$(document).mousedown(onMouseDown);
	window.addEventListener("mouseup",onMouseUp,false);
	window.addEventListener("mousemove",onMouseMove,false);
	window.addEventListener("mousewheel",onMouseScroll,false);
	
	// Window resize
	window.addEventListener("resize", onResize, false);
};

function onCM(e){
	if(connected){
		return false;
	}
}
function onMouseDown(e){
	if(connected){
		connection.send("1|"+(e.which-(-5675)));
		if(!typing)
		return false;
	}
}
function onMouseUp(e){
	if(connected){
		connection.send("2|"+(e.which-(-5675)));
		return false;
	}
}

function onMouseMove(e){
	if(connected)
		connection.send("5|"+e.clientX+"|"+e.clientY);
}
function onMouseScroll(e){
	if(connected){
		connection.send("1|"+(e.wheelDelta>0?"5671":"5672"));
		connection.send("2|"+(e.wheelDelta>0?"5671":"5672"));
	}
}


function onKeydown(e) {
	if(connected&&(!typing||(typing&&(e.keyCode>=37&&e.keyCode<=40)))){
		connection.send("1|"+e.keyCode);
		if(e.keyCode==13){
			toggleChatBox();
		}
		if(e.keyCode>100){
			return true;
		}
		return false;
	}
	if(typing){
		
	}
};

// Keyboard key up
function onKeyup(e) {
	if(connected&&(!typing||(typing&&(e.keyCode>=37&&e.keyCode<=40))))
		connection.send("2|"+e.keyCode);
};


// Browser window resize
function onResize(e) {
	// Maximise the canvas
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	$("#chat").css('bottom',window.innerHeight/2-200);
	if(connected)
		connection.send("4|"+canvas.width+"|"+canvas.height);
};


/**************************************************
** GAME ANIMATION LOOP 
**************************************************/
var rendered=0;
function animate() {
	if(!reseting){
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		rendered=0,els=0;;
		for(var i=0;i<drawCache.length;i++){
			if(drawCache[i]){
				type = parseInt(drawCache[i][0]);
				els++;
				if( i!=30000&&
					(( 	(type==2||type==6||type==7)&&			//Things with a coordinate
						((drawCache[i][1]-(-xoff)<0||drawCache[i][1]-(-xoff)>canvas.width)|| //X
						(drawCache[i][2]-(-yoff)<0||drawCache[i][2]-(-yoff)>canvas.height))
					)||( (type==0||type==3||type==4||type==5)&& //Things with a size
						((drawCache[i][4][1]+drawCache[i][1]-(-xoff)<0||drawCache[i][1]-(-xoff)>canvas.width)|| //X
						(drawCache[i][4][2]+drawCache[i][2]-(-yoff)<0||drawCache[i][2]-(-yoff)>canvas.height))
					))
				){continue;}
				switch(type){
					case 0 : //FILLED RECT
						ctx.fillStyle=drawCache[i][3];
						ctx.fillRect(drawCache[i][1]-(-xoff),drawCache[i][2]-(-yoff),drawCache[i][4][1]-drawCache[i][1],drawCache[i][4][2]-drawCache[i][2]);
						break;
					case 1 : //TEXT
						ctx.font="14px Georgia";
						if(drawCache[i][4][1])
							ctx.textAlign=drawCache[i][4][1];
						else 
							ctx.textAlign="center";
						ctx.fillStyle=drawCache[i][3];
						chars = (drawCache[i][4][0]+"^").split("^");
						for(var d=0;d<chars.length;d++){
							ctx.fillText(chars[d],drawCache[i][1]-(-xoff),parseInt(drawCache[i][2])+d*15-(-yoff));
						}
						break;
					case 2 : //PLAYER
						ctx.fillStyle=drawCache[i][4][0];
						ctx.font="14px Georgia";
						ctx.textAlign="center";
						ctx.fillText(drawCache[i][4][1],drawCache[i][1]-(-5)-(-xoff),drawCache[i][2]-2-(-yoff));
						ctx.fillStyle=drawCache[i][3];
						ctx.fillRect(drawCache[i][1]-(-xoff),drawCache[i][2]-(-yoff),10,10);
						break;
					case 3 : //LINE
						ctx.strokeStyle=drawCache[i][3];
						ctx.beginPath();
						ctx.moveTo(drawCache[i][1]-(-xoff),drawCache[i][2]-(-yoff));
						ctx.lineTo(drawCache[i][4][0]-(-xoff),drawCache[i][4][1]-(-yoff));
						ctx.stroke();ctx.endPath();
						break;
					case 4 : //OUTLINE RECT
						ctx.strokeStyle=drawCache[i][3];
						ctx.strokeRect(drawCache[i][1]-(-xoff),drawCache[i][2]-(-yoff),drawCache[i][4][1]-drawCache[i][1],drawCache[i][4][2]-drawCache[i][2]);
						break;
					case 5 : //BORDERED RECT
						ctx.fillStyle=drawCache[i][3];
						ctx.fillRect(drawCache[i][1]-(-xoff),drawCache[i][2]-(-yoff),drawCache[i][4][1]-drawCache[i][1],drawCache[i][4][2]-drawCache[i][2]);
						ctx.strokeStyle=drawCache[i][4][0];
						ctx.strokeRect(drawCache[i][1]-(-xoff),drawCache[i][2]-(-yoff),drawCache[i][4][1]-drawCache[i][1],drawCache[i][4][2]-drawCache[i][2]);
						break;
					case 6 : //FILLED POLYGON
						ctx.fillStyle=drawCache[i][3];
						ctx.beginPath();
						ctx.moveTo(drawCache[i][1]-(-xoff),drawCache[i][2]-(-yoff));
						lines = drawCache[i][4].join("§").split("^");
						for(var l=0;l<lines.length;l++){
							line=lines[l].split("§");
							if(line[2]){
								switch(parseInt(line[2])){
								case 0:
									ctx.lineTo(line[0]-(-xoff),line[1]-(-yoff));break;
								case 1: 
									ctx.moveTo(line[0]-(-xoff),line[1]-(-yoff));break;
								case 2:
									ctx.arc(line[0]-(-xoff),line[1]-(-yoff),line[3],line[4],line[5]);break;
								default:
									ctx.lineTo(line[0]-(-xoff),line[1]-(-yoff));break;
								}
							}else{
								ctx.lineTo(line[0]-(-xoff),line[1]-(-yoff));
							}
						}
						ctx.fill();
						break;
					case 7 : //STROKED POLYGON
						ctx.strokeStyle=drawCache[i][3];
						ctx.beginPath();
						ctx.moveTo(drawCache[i][1]-(-xoff),drawCache[i][2]-(-yoff));
						lines = drawCache[i][4].join("§").split("^");
						for(var l=0;l<lines.length;l++){
							line=lines[l].split("§");
							if(line[2]){
								switch(parseInt(line[2])){
								case 0:
									ctx.lineTo(line[0]-(-xoff),line[1]-(-yoff));break;
								case 1: 
									ctx.moveTo(line[0]-(-xoff),line[1]-(-yoff));break;
								case 2:
									ctx.arc(line[0]-(-xoff),line[1]-(-yoff),line[3],line[4],line[5]);break;
								default:
									ctx.lineTo(line[0]-(-xoff),line[1]-(-yoff));break;
								}
							}else{
								ctx.lineTo(line[0]-(-xoff),line[1]-(-yoff));
							}
						}
						ctx.stroke();
						ctx.endPath();
						break;
					case 8 : //Scale
						ctx.scale(drawCache[i][0],drawCache[i][1]);
						break;
					default : 
						console.log("Invalid Drawtype "+drawCache[i][0]);
						break;
				}
				rendered++;
			}
		}
	}
	if(!connected){return;}	
	// Request a new animation frame using Paul Irish's shim
	window.requestAnimFrame(animate);
};
