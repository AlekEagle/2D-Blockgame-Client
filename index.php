<!DOCTYPE html>

<html lang="en">

	<head>
		<title>BoxGame</title>
		<meta charset="utf-8">
		<style>
		body {
			overflow: hidden;
			margin:0px;
		}

		canvas {
			display: block;
		}
		opacity{
			opacity: 0;
		}
		</style>
	</head>
	
	<body>
		<div id="menu" style="top:50%;position:absolute;width:20%;min-width:300px;height:50%;min-height:400px;left:50%;transform: translate(-50%, -50%);background-color:#2F4F4F;opacity:0.8;border:0px solid;border-radius:5px">
			<div><center><h1>GoGame</h1></center></div>
			<div style="width:100%;display:block">
			<center>
			<form onsubmit="doIt();" action="#" method="GET">
				<div style="width:90%;display:inline-block;top:5px;position:relative;">
					<input id="name" style="width:100%;height:20px;" placeholder="Your Name"/>
				</div>
				<div style="width:80%;top:5px;height:24px;display:inline-block;position:relative;">
					<input type="submit" id="play" onClick="" style="width:100%;height:100%;" value="Login">
				</div>
			</form>
			</center>
			</div>
		</div>
		
		<div id="chat" style="position:absolute;bottom:20%;">
			<textarea id="chatbox" rows=10 cols=50 style="resize:none;display:none;" readonly></textarea>
			<form id="enterMessage" style="resize:none;opacity:0;" name="chatForm" action="#" onsubmit="return sendChatMessage();">
			  <input id="msgBox" style="width:369px;" type="text" autocomplete="off" name="msg">
			  <input style="display:none;" type="submit" value="Submit">
			</form>
		</div>
		
		
		<canvas id="gameCanvas"></canvas>
		<script src="https://gocode.it/TIWD/OldGame/js/jquery.min.js"></script>
		<script src="https://gocode.it/TIWD/OldGame/js/requestAnimationFrame.js"></script>
		<script src="https://gocode.it/TIWD/OldGame/js/md5.js"></script>
		<script src="https://gocode.it/TIWD/OldGame/js/game.js"></script>
		<script src="https://gocode.it/TIWD/OldGame/js/lz-string.js"></script>
		<script>
			var username,password;
			function doIt(){
				username = document.getElementById('name').value;
				init();
				animate();
				return false;
			}
			setEventHandlers();
			function HideMenu(){
				document.getElementById("menu").style.display = "none";
			}
			function unHideMenu(){
				document.getElementById("menu").style.display = "block";
			}
		</script>
	</body>
</html>
