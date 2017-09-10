var util = require('util');
// var zvm = require('zvm');

// Slack will send a request for each message sent on any or a specific channel.
// If trigger word has been configured on Slack, only messages starting with
// that trigger word will be sent

var commands = [ 'zbhelp', 'zblist', 'zbstart', 'zbrestart', 'zbend' ];

function startGame(tokens, context, cb) {
  if (!tokens[1]) {
    return cb(null, { text: "No game specified." });
  }
  
}

function endGame(tokens, context, cb) {
  var game = "zork";
  return cb(null, { text: "Game ended!", game: game });
}

function doCommand(tokens, context, cb) {
  if (tokens[0] === 'zbhelp') {
    return cb(null, { text: "Commands are: \n\nzbhelp - this!\n" +
                                "zbstart [game] - start a new game of [game]\n"+
                                "zblist - list available games\n" +
                                "zbrestart - abort current game and restart\n" +
                                "zbend - end current game\n\n" });
  } else if (tokens[0] === 'zblist') {
    return cb(null, { text: "Available games are: \n\n" } );
  } else if (tokens[0] === 'zbstart') {
    return startGame(tokens, context, cb);
  } else if (tokens[0] === 'zbrestart') {
    return endGame(tokens, context, function(err, result) {
      return startGame(tokens, context, cb);
    });
  } else if (tokens[0] === 'zbend') {
    return endGame(tokens, context, cb);
  } else {
    return cb(null, null);
  }
}

module.exports = function (context, done) {
  console.log('slack request: ', util.inspect(context.body));

  // Ignore messages I sent so we don't loop!
  if (context.body.bot_id && context.body.bot_id === 'B70N05VB4') {
    return done(null, null);
  }
  
  var cmd = context.body.text;
  
  if (!cmd) {
    return done(null, null);
  } 

  var tokens = cmd.trim().toLowerCase().split(" ");
  
  if (commands.indexOf(tokens[0]) != -1) {
    // This is our command to handle.  
    console.log("Got command: " + tokens[0]);
    
    return doCommand(tokens, context, done);
  }
  

  done(null, { text: 'Ok!'} );
};










