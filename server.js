const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;
var os = require('os');

// Connect to mongo
mongo.connect('mongodb://127.0.0.1/mongochat', function(err, db){
    if(err){
        throw err;
    }

    console.log('MongoDB connected...');

    // Connect to Socket.io
    client.on('connection', function(socket){
        let chat = db.collection('chats');
        let QandA = db.collection('QandA');

       
        
        //adding elements to the collection Q&A
        var obj = [
            { q: '1', a: 'Before you may board a flight, all passengers 18 years of age and older are required to present photo ID issued by a government authority (example: driver’s license or passport). If you don’t have either of those, please consult directly with the airline for alternatives. If you are traveling outside of the United States, all passengers are required to have a passport.'},

            { q: '2', a: 'It isn’t mandatory, but we highly encourage you to do so. Airlines regularly alter their schedules or change their flight numbers. We make every attempt to contact you when there is a change. However, there are rare occasions when we are not correctly notified by the airlines that a change has occurred. Reconfirmation helps to detect a problem before you arrive at the airport. We recommend that you contact us or check with the airline directly 24-72 hours prior to departure.'},

            { q: '3', a: 'It varies on airline and destination. It is always best to check directly with the airline. You can help avoid vacation stress by arriving at most airports at least 90 minutes prior to scheduled departure time for domestic flights and 120 minutes prior for International flights. Some large airports like Chicago O’Hare, New York JFK, Los Angeles, etc require even more time so plan accordingly.'},

            { q: '4', a: 'You should always keep ticket receipts, tour documents, and identification with you at all times. Never pack necessary daily medication in checked baggage; pack it in your carry-on. We also recommend that you carry a change of clothing and toiletries. Most airlines have greatly reduced meal service so we encourage you to pack healthy snacks. When traveling internationally you are not allowed to take fresh fruit, vegetables, flowers to other countries or return back to the USA with them as they may harbor insects. Follow the TSA guidelines of the 3-1-1 rule: all liquid, gel or aerosol items in your carry-on bag must be 3 oz or less, placed together in a clear one quart ziplock bag, 1 bag per person.'},

            { q: '5', a: 'You are not allowed weapons or sharp weapon like objects. It is recommended that sharp cuticle scissors be placed in your checked luggage. Butane type cigarette lighters, matches, flammable liquids, fireworks, household items such as bleach, drain cleaners and other toxic chemicals are not allowed and will be confiscated. It is always good practice to check with applicable carrier for specific details.'},

            { q: '6', a: 'Yes. As technology continues to improve, airlines encourage you to check in advance. Please visit the web-site of the airline involved. In most cases you will need your reservation number (also called record locator #) OR e-ticket number. Most boarding passes can only be issued within 24 hours of flight time.'},

            { q: '7', a: 'Travel Protection plans are available and recommended to help protect you and your trip investment. Travel Protection Policies offered by most major travel insurance providers include benefits such as Trip Cancellation, Trip Interruption, Emergency Medical and Emergency Evacuation/Repatriation, Trip Delay, Baggage Delay and more. Please ask our trained travel professionals for details.'},

            { q: '8', a: 'The Intelligence Reform and Terrorism Prevention Act of 2004 requires that by January 1, 2008 travelers to/from all international destinations INCLUDING Canada, Caribbean, Bermuda, Bahamas & Mexico must have a passport.'},

            {q: '9', a:'Book a ticket when you need it. And no, there isn’t. But it’s a qualified “no.” Research suggests that if you buy your ticket when most people do — between one and four months before you fly — you’re likely to find the lowest price. Don’t push the button too early or too late, because fares tend to rise, especially as you close in on your departure date. Some airfare soothsayers claim you can find a bargain by waiting until a particular day and time, like Wednesday at 1 a.m. in the airline’s time zone. But the savings are minimal and probably not worth your time, not to mention the lost sleep.'},
            
            {q: '10', a:'Major cruise lines once had fairly specific identities. Carnival was the line for younger partiers, Royal Caribbean was family-oriented, Holland America catered to an older crowd. But in recent years, those distinctions have eroded. Instead, the individual ship, price, itinerary, time of year and departing port are the deciding factors. Yes, a Disney cruise to the Bahamas over spring break still draws mostly families with younger children. But so will just about any mid-priced cruise sailing from Florida at that time. Here are some basic instructions for choosing correctly: Pick an itinerary: The Caribbean and Alaska appeal to families. The Mediterranean is more about sightseeing in the ports than time spent aboard ship. River cruises, sailing vessels and expedition itineraries attract an older, well-traveled crowd.'}
          ];

          QandA.insertMany(obj, function(err, res) {
            if (err) 
                throw err;
            console.log("Number of documents inserted: " + res.insertedCount);
          });

        // Create function to send status
        sendStatus = function(s){
            socket.emit('status', s);
        }

        // Get chats from mongo collection
        chat.find().limit(100).sort({_id:1}).toArray(function(err, res){
            if(err){
                throw err;
            }

            // Emit the messages
            socket.emit('output', res);
        });

        // Handle input events
        socket.on('input', function(data){
            let name = data.name;
            let message = data.message;

            // Check for name and message
            if(name == '' || message == ''){
                // Send error status
                sendStatus('Please enter a name and message');
            } else {
                // Insert message
                chat.insert({name: name, message: message}, function(){
                    client.emit('output', [data]);

                    // Send status object
                    sendStatus({
                        message: 'Message sent',
                        clear: true
                    });
                });

                QandA.findOne({ q: message },function(err, result) {
                    if (err) 
                        throw err;
                    else
                    {
                        let name = "Travel Agency";
                        if(result !=null)
                            message = result.a;
                        else 
                            message = "Sorry, the answer to this question is not supported yet..";
                        chat.insert({name: name, message: message}, function(){
                            client.emit('output', [{name: name, message: message}]);
        
                            // Send status object
                            sendStatus({
                                message: 'Message sent',
                                clear: true
                            });
                        }); 
                    }
                });
            }
        });

        // Handle clear
        socket.on('clear', function(){
            chat = db.collection('chats');

            //adding the greeting message
            
            
            
            // Remove all chats from collection
            chat.remove({}, function(){
                // Emit cleared
                socket.emit('cleared',obj);
            });

            
        });
    });
});