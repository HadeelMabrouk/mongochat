(function(){
    var element = function(id){
        return document.getElementById(id);
    }

    // Get Elements
    var status = element('status');
    var messages = element('messages');
    var textarea = element('textarea');
    var username = element('username');
    var clearBtn = element('clear');

    // Set default status
    var statusDefault = status.textContent;

    var data = [
                {name: "10" ,message: "How do I choose a cruise?"},
                {name: "9" ,message: "When should I buy my airline ticket? Is there a way to game the system?"},
                {name: "8" ,message: "Do I need a passport to travel outside the United States and how do I get one if I do?"},
                {name: "7" ,message: "Is travel insurance really necessary?"},
                {name: "6" ,message: "Can I obtain my boarding pass before I get to the airport?"},
                {name: "5" ,message: "What do I need to avoid packing in my carry-on bag?"},
                {name: "4" ,message: "What should I pack in my carryon bag?"},
                {name: "3" ,message: "When do I need to be at the airport to check in for my flight?"},
                {name: "2" ,message: "Do I need to reconfirm my flights before I leave?"},
                {name: "1" ,message: "What kind of documentation do I need to travel?"},
                {name: "Travel Agency" ,message: "Welcome to our travel agency! Please, send the number of your question. Here is a list of our supported questions:"}];

            messages.textContent = '';
            if(data.length){
                for(var x = 0;x < data.length;x++){
                    // Build out message div
                    var message = document.createElement('div');
                    message.setAttribute('class', 'chat-message');
                    message.textContent = data[x].name+": "+data[x].message;
                    messages.appendChild(message);
                    messages.insertBefore(message, messages.firstChild);
                }
            }

    var setStatus = function(s){
        // Set status
        status.textContent = s;

        if(s !== statusDefault){
            var delay = setTimeout(function(){
                setStatus(statusDefault);
            }, 4000);
        }
    }

    // Connect to socket.io
    var socket = io.connect('http://127.0.0.1:4000');

    // Check for connection
    if(socket !== undefined){
        console.log('Connected to socket...');

        // Handle Output
        socket.on('output', function(data){
            //console.log(data);
            if(data.length){
                for(var x = 0;x < data.length;x++){
                    // Build out message div
                    var message = document.createElement('div');
                    message.setAttribute('class', 'chat-message');
                    message.textContent = data[x].name+": "+data[x].message;
                    messages.appendChild(message);
                    messages.insertBefore(message, messages.firstChild);
                }
            }
        });

        // Get Status From Server
        socket.on('status', function(data){
            // get message status
            setStatus((typeof data === 'object')? data.message : data);

            // If status is clear, clear text
            if(data.clear){
                textarea.value = '';
            }
        });

        // Handle Input
        textarea.addEventListener('keydown', function(event){
            if(event.which === 13 && event.shiftKey == false){
                // Emit to server input
                socket.emit('input', {
                    name:username.value,
                    message:textarea.value
                });

                event.preventDefault();
            }
        })

        // Handle Chat Clear
        clearBtn.addEventListener('click', function(){
            socket.emit('clear');
        });

        // Clear Message
        socket.on('cleared', function(){
            var data = [
                {name: "10" ,message: "How do I choose a cruise?"},
                {name: "9" ,message: "When should I buy my airline ticket? Is there a way to game the system?"},
                {name: "8" ,message: "Do I need a passport to travel outside the United States and how do I get one if I do?"},
                {name: "7" ,message: "Is travel insurance really necessary?"},
                {name: "6" ,message: "Can I obtain my boarding pass before I get to the airport?"},
                {name: "5" ,message: "What do I need to avoid packing in my carry-on bag?"},
                {name: "4" ,message: "What should I pack in my carryon bag?"},
                {name: "3" ,message: "When do I need to be at the airport to check in for my flight?"},
                {name: "2" ,message: "Do I need to reconfirm my flights before I leave?"},
                {name: "1" ,message: "What kind of documentation do I need to travel?"},
                {name: "Travel Agency" ,message: "Welcome to our travel agency! Please, send the number of your question. Here is a list of our supported questions:"}];

            messages.textContent = '';
            if(data.length){
                for(var x = 0;x < data.length;x++){
                    // Build out message div
                    var message = document.createElement('div');
                    message.setAttribute('class', 'chat-message');
                    message.textContent = data[x].name+": "+data[x].message;
                    messages.appendChild(message);
                    messages.insertBefore(message, messages.firstChild);
                }
            }
        });
    }

})();