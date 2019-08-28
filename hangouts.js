var gearmanode = require('gearmanode');

var gearman_client = gearmanode.client();

var Client = require('hangupsjs');
var Q = require('q');

//var linkify = require('linkifyjs');
//require('linkifyjs/plugins/hashtag')(linkify); // optional
//var linkifyHtml = require('linkifyjs/html');

const var_dump = require('var_dump')

// Turn off Gearman node debug
winston = require('winston');
for (key in winston.loggers.loggers) {
    winston.loggers.loggers[key].clear();
}

// callback to get promise for creds using stdin. this in turn
// means the user must fire up their browser and get the
// requested token.
var creds = function() {
  return {
    auth: Client.authStdin
  };
};

var client = new Client();

console.log("Hangouts client started.")

client.connect(creds).then(function() {
  console.log("Client connected.")
});

var list = new Array(45)
client.on("chat_message", function(ev) {
  console.log('Received a chat message.');

  if (ev.chat_message.message_content.segment &&
      ev.self_event_state.user_id.gaia_id != ev.sender_id.gaia_id) {

    var event_id = ev.event_id;
    console.log(event_id)

    if (list.includes(event_id)) {return;}

    list.push(event_id)
    list.shift()

    var_dump(ev);

//    var to = ev.sender_id.gaia_id;
//    var from = ev.conversation_id.id;

    var to = ev.conversation_id.id;
    var from = "agent";

//    var from = "elden";
//    var to = ev.conversation_id.id;

    var subject = ev.chat_message.message_content.segment[0].text;

    var word_count = subject.split(" ").length;

    var match = false

    var agent_name = "agent";

    console.log("Counted " + word_count + " words");
    if (subject.toLowerCase().includes('kaiju')) {
      if (word_count > 1) {
        var pattern = new RegExp("kaiju", 'gi');
        var subject = subject.replace(pattern, '');
//        var subject = subject.replace(/kaiju/g,'');
      }
      match = true;
    }
    console.log("subject " +subject);
    if (subject.toLowerCase().includes('elden')) {
      var agent_name = "elden";
      if (word_count > 1) {
        var subject = subject.replace(/elden/g,'');
      }
      match = true;
    }

    if (subject.toLowerCase().includes('hal9000')) {    
      var agent_name = "hal9000";
      if (word_count > 1) {
        var subject = subject.replace(/hal9000/g,'');
      }
      match = true;
    }

    if (subject.toLowerCase().includes('hal')) {    
      var agent_name = "hal9000";
      if (word_count > 1) {
        var subject = subject.replace(/hal/g,'');
      }
      match = true;
    }


    if (subject.toLowerCase().includes('edna bot')) {
      var agent_name = "edna";
      if (word_count > 1) {
        var subject = subject.replace(/edna bot/g,'');
      }
      match = true;
    }


    if (subject.toLowerCase().includes('ednabot')) {
      var agent_name = "edna";
      if (word_count > 1) {
        var subject = subject.replace(/ednabot/g,'');
      }
      match = true;
    }

    if (subject.toLowerCase().includes('edna')) {
      var agent_name = "edna";
      if (word_count > 1) {
        var subject = subject.replace(/edna/g,'');
      }
      match = true;
    }

    if (subject.toLowerCase().includes('control')) {
      if (word_count ==1) {
        match = true;
        var agent_name = "control";
      }
    }

    if (subject.toLowerCase().includes('contact')) {
      if (word_count ==1) {
        match = true;
        var agent_name = "control";
      }
    }

    if (subject.toLowerCase().includes('break')) {
      if (word_count ==1) {
        match = true;
        var agent_name = "control";
      }
    }

    if (subject.toLowerCase().includes('hythe bot')) {
      var agent_name = "hythebot";
      if (word_count > 1) {
        var subject = subject.replace(/hythe bot/g,'');
      }
      match = true;
    }

    if (subject.toLowerCase().includes('hythebot')) {    
      var agent_name = "hythebot";
      if (word_count > 1) {
        var subject = subject.replace(/hythebot/g,'');
      }
      match = true;
    }

    if (subject.toLowerCase().includes('hythe')) {
      var agent_name = "hythebot";
      if (word_count > 1) {
        var subject = subject.replace(/hythe/g,'');
      }
      match = true;
    }


//    var_dump(match);

    if (match == false) {
      console.log("No agent recognized. Datagram ignored.");
      return;
    }

    console.log("Reading datagram.");

    var arr = {"from":from,"to":to,"subject":subject}
    var datagram = JSON.stringify(arr)

    try {
      var job = gearman_client.submitJob('call_agent', datagram);
      console.log("Send to Gearman.");

    }
    catch (e) {
      console.log("Error from Gearman.");
      var sms = "quiet"
      var message = "Quietness. Just quietness."
    }

    job.on('workData', function(data) {
    //    console.log('WORK_DATA >>> ' + data);
    });

    job.on('complete', function() {
console.log("Gearman response completed.");
      sms = "sms"
      message = "sms"

      try {
        var thing_report = JSON.parse(job.response);
        var sms = thing_report.sms
        var message = thing_report.message
      }

      catch (e) {
        console.log("Error parsing Gearman response.");
        var sms = "quiet"
        var message = "Quietness. Just quietness."
      }

//      var sms = thing_report.sms
//      var message = thing_report.message
console.log("to " + to);
console.log("sms " + sms);
console.log("Done");

//sms = linkifyHtml(sms, {
//  defaultProtocol: 'http'
//});

if (sms == null) {sms = agent_name.toUpperCase() + " | ?";}
var response = [[0, sms]]; 
var_dump(response);
      return client.sendchatmessage(to, response);

//      return client.sendchatmessage(to, [[0, sms]]);

//      return client.sendchatmessage(from, [[0, sms]]);
    });
  }
});

// https://buildmedia.readthedocs.org/media/pdf/hangups/v0.3.3/hangups.pdf

//client.on('typing', msg => {
//    console.log("Typing")
//    var to = msg.user_id.gaia_id;
//    var from = msg.conversation_id.id;
//    console.log(to + " " + from + " " +"Typing")
//});

//client.on('client_conversation', msg => {
//    console.log("Client conversation")
//});

//client.on('easter_egg', msg => {
//    console.log("Easter Egg")
//});

//client.on('self_presence', msg => {
//    console.log("Self Presence")
//});

//client.on('presence', msg => {
//    console.log("Presence")
//});

//client.connect(credsfunc).then(() => {
//    console.log('Client logged in.');
//});

var reconnect = function() {
    client.connect(creds).then(function() {
    console.log("Re-connected.")

        // we are now connected. a `connected`
        // event was emitted.
    });
};

// whenever it fails, we try again
client.on('connect_failed', function() {
    console.log("Connect failed")
    Q.Promise(function(rs) {
        // backoff for 3 seconds
        setTimeout(rs,3000);
    }).then(reconnect);
});

// start connection
reconnect();
