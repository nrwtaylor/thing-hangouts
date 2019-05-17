var gearmanode = require('gearmanode');

var gearman_client = gearmanode.client();

var Client = require('hangupsjs');
var Q = require('q');

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
  console.log('chat_message');

  if (ev.chat_message.message_content.segment &&
      ev.self_event_state.user_id.gaia_id != ev.sender_id.gaia_id) {

    var event_id = ev.event_id;
    console.log(event_id)

    if (list.includes(event_id)) {return;}

    list.push(event_id)
    list.shift()

    var to = ev.sender_id.gaia_id;
    var from = ev.conversation_id.id;

    var subject = ev.chat_message.message_content.segment[0].text;
    var match = false

    if (subject.toLowerCase().includes('kaiju')) {
      var ret = subject.replace(/kaiju/g,'');
      match = true;
    }

    if (subject.toLowerCase().includes('elden')) {
      var ret = subject.replace(/elden/g,'');
      match = true;
    }

    if (subject.toLowerCase().includes('hythe')) {
      var ret = subject.replace(/hythe/g,'');
      match = true;
    }

    if (subject.toLowerCase().includes('edna')) {
      var ret = subject.replace(/edna/g,'');
      match = true;
    }

    if (match == false) {return;}

    var arr = {"from":from,"to":to,"subject":subject}
    var datagram = JSON.stringify(arr)

    try {
      var job = gearman_client.submitJob('call_agent', datagram);
    }
    catch (e) {
      var sms = "quiet"
      var message = "Quietness. Just quietness."
    }

    job.on('workData', function(data) {
    //    console.log('WORK_DATA >>> ' + data);
    });

    job.on('complete', function() {

      sms = "sms"
      message = "sms"

      try {
        var thing_report = JSON.parse(job.response);
        var sms = thing_report.sms
        var message = thing_report.message
      }

      catch (e) {
        var sms = "quiet"
        var message = "Quietness. Just quietness."
      }

//      var sms = thing_report.sms
//      var message = thing_report.message

      return client.sendchatmessage(from, [[0, sms]]);
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
