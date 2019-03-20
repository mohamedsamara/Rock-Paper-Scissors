$(document).ready(function() {
  // Initialize Firebase
  var config = {
    apiKey: 'AIzaSyBBgGNxd_SS45NxKnl0r9TZG1rDtJ5Ub1w',
    authDomain: 'rock-paper-scissors-f9ed2.firebaseapp.com',
    databaseURL: 'https://rock-paper-scissors-f9ed2.firebaseio.com',
    projectId: 'rock-paper-scissors-f9ed2',
    storageBucket: '',
    messagingSenderId: '378816581305'
  };
  firebase.initializeApp(config);

  // Create a variable to reference the database
  var database = firebase.database();

  var p1 = null;
  var p2 = null;
  var turn = 1;
  var yourPlayerName = '';
  var choice = '';

  // get players data
  var getPlayers = function() {
    database.ref('/players').on('value', function(snapshot) {
      // Check if player 1 exists in the database
      if (snapshot.child('p1').exists()) {
        // Record player1 data
        p1 = snapshot.val().p1;
        // Update player1 display
        $('#user-label').text(p1.name);
        $('#user-score').text(p1.win);
      } else {
        p1 = null;

        // Update player1 display
        $('#user-label').text('Waiting for Player 1...');

        database.ref('/outcome').remove();
      }

      // Check for existence of player 2 in the database
      if (snapshot.child('p2').exists()) {
        // Record player2 data
        p2 = snapshot.val().p2;
        // Update player2 display
        $('#comp-label').text(p2.name);
        $('#comp-score').text(p2.win);
      } else {
        p2 = null;

        // Update player2 display
        $('#comp-label').text('Waiting for Player 2...');

        database.ref('/outcome').remove();
      }

      // If both players are now present, it's player1's turn
      if (p1 && p1) {
        $('.waiting-notice').text('Waiting on ' + p1.name + ' to choose...');
      }

      // If both players leave the game
      if (!p1 && !p1) {
        database.ref('/turn').remove();
        database.ref('/outcome').remove();

        $('.waiting-notice').text('');
      }
    });
  };

  // get turn data
  var getTurn = function() {
    database.ref('/turn').on('value', function(snapshot) {
      if (snapshot.val()) {
        if (snapshot.val() === 1) {
          turn = 1;

          if (p1 && p2) {
            $('.waiting-notice').text(
              'Waiting on ' + p1.name + ' to choose...'
            );
          }
        } else if (snapshot.val() === 2) {
          turn = 2;
          if (p1 && p2) {
            $('.waiting-notice').text(
              'Waiting on ' + p2.name + ' to choose...'
            );
          }
        }
      }
    });
  };

  // On-click function for submitting a name.
  $('#submit-user').on('click', function() {
    yourPlayerName = $('#new-user')
      .val()
      .trim();

    if (
      $('#new-user')
        .val()
        .trim() !== '' &&
      !(p1 && p2)
    ) {
      // Adding p1
      if (p1 === null) {
        p1 = {
          name: yourPlayerName,
          win: 0,
          loss: 0,
          tie: 0,
          choice: ''
        };

        database
          .ref()
          .child('/players/p1')
          .set(p1);

        turn = 1;

        database
          .ref()
          .child('/turn')
          .set(turn);

        database
          .ref('/players/p1')
          .onDisconnect()
          .remove();
      } else if (p1 !== null && p2 === null) {
        yourPlayerName = $('#new-user')
          .val()
          .trim();
        p2 = {
          name: yourPlayerName,
          win: 0,
          loss: 0,
          tie: 0,
          choice: ''
        };

        database
          .ref()
          .child('/players/p2')
          .set(p2);

        database
          .ref('/players/p2')
          .onDisconnect()
          .remove();
      }

      $('.user-info').fadeOut();
    }
  });

  //player 1 click handler
  $('#p1').on('click', '.choice', function() {
    if (p1 && p2 && yourPlayerName == p1.name) {
      choice = $(this).attr('id');

      database
        .ref()
        .child('/players/p1/choice')
        .set(choice);

      turn = 2;

      database
        .ref()
        .child('/turn')
        .set(turn);
    }
  });

  //player 2 click handler
  $('#p2').on('click', '.choice', function() {
    if (p1 && p2 && yourPlayerName == p2.name) {
      choice = $(this).attr('id');

      database
        .ref()
        .child('/players/p2/choice')
        .set(choice);
    }
  });

  getPlayers();
  getTurn();
});
