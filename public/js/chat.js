$(function(){
   	//make connection and open form
   	//function openForm() {
   		var socket = io.connect('http://localhost:3000')
		//document.getElementById("myForm").style.display = "block";
   // }
    
   // function closeForm() {
	//  document.getElementById("myForm").style.display = "none";
   // }
	

	//buttons and inputs
//	var chatstart = $("#log")
	var message = $("#message")
	var username = $("#username")
	var send_message = $("#send_message")
	var send_username = $("#send_username")
	var chatroom = $("#chatroom")
	var feedback = $("#feedback")
	
	//open chat form
	chatstart.click(function(){
		openForm()
	})

	//Emit message
	send_message.click(function(){
		console.log('clicked')
		//alert('clicked')
		socket.emit('new_message', {message : message.val()})
	})

	//Listen on new_message
	socket.on("new_message", (data) => {
		feedback.html('');
		message.val('');
		chatroom.append("<p class='message'>" + data.username + ": " + data.message + "</p>")
	})

	//Emit a username
	send_username.click(function(){
		socket.emit('change_username', {username : username.val()})
	})

	//Emit typing
	message.bind("keypress", () => {
		socket.emit('typing')
	})

	//Listen on typing
	socket.on('typing', (data) => {
		feedback.html("<p><i>" + data.username + " is typing a message..." + "</i></p>")
	})
});
