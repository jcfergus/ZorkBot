var util = require('util');
var ifvms = require('ifvms');

// Slack will send a request for each message sent on any or a specific channel.
// If trigger word has been configured on Slack, only messages starting with
// that trigger word will be sent

var commands = [ 'zbhelp', 'zblist', 'zbstart', 'zbrestart', 'zbend' ];

function startGame(tokens, context, cb) {
  if (!tokens[1]) {
    return cb(null, { text: "No game specified." });
  }

  var username = context.data.user_name;

  context.storage.get(function(err, data) {
    if (err) {
      return cb(err);
    }

    if (data.saves[username] && data.saves[username].game && data.saves[username].state) {
      return cb(null, { text: "There is already a game of " + data.saves[username].game + " in progress.  Please end it with 'zbend' first."} );
    }

    if (Object.keys(data.games).indexOf(tokens[1]) == -1) {
      return cb(null, { text: "Invalid game name specified."});
    }

    cb(null, { text: "Starting a game of " + data.games[tokens[1]].description });
  });
}

function endGame(tokens, context, cb) {
  var game = "zork";
  return cb(null, { text: "Game ended!", game: game });
}

function doCommand(tokens, context, cb) {
  // This is a bit dirty but just want to get it working. 
  if (tokens[0] === 'zbhelp') {
    return cb(null, { text: "Commands are: \n\nzbhelp - this!\n" +
    "zbstart [game] - start a new game of [game]\n"+
    "zblist - list available games\n" +
    "zbrestart - abort current game and restart\n" +
    "zbend - end current game\n\n" });
  } else if (tokens[0] === 'zblist') {
    return context.storage.get( function(err, data) {
      return cb(null, { text: "Available games are: \n\n" +
      Object.keys(data.games).map(function (key) {
        return "Name: " + key + "   Description: " + data.games[key].description
      }).join("\n") + "\n" } );
    });
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

function getUserGame(context, cb) {
  context.storage.get(function(err, data) {
    if (err) {
      return cb(err);
    }

    var username = context.body.user_name;
    if (!username) {
      // No username was sent.  Shouldn't happen but good to check.
      return cb(null, null);
    }

    if (Object.keys(data.saves).indexOf(username) == -1) {
      // No entry in the saves object == no saved game.
      return cb(null, null);
    }
    
    return cb(null, data.saves['username']);
  });
}

function processGameCommand(context, gamedata, cb) {
  
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

  getUserGame(context, function (err, gamedata) {
    if (err) {
      return done(err);
    }

    if (!gamedata) {
      return done(null, null);  // If the user doesn't have an active game, we're done.
    }

    processGameCommand(context, gamedata, function(err, result) {
        if (err) {
          return done(err);
        } 
      
        // Handle result
        return done(null, { text: 'Game response.'} ); 
    });
  });

  done(null, { text: 'Ok!'} );
};
