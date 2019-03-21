$(document).ready(function() {
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
      showHideChoices();
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

  // show & hide choices based on the player
  var showHideChoices = function() {
    if (p1 && yourPlayerName == p1.name) {
      displayChoices(1);
      hideChoices(2);
    }

    if (p2 && yourPlayerName == p2.name) {
      displayChoices(2);
      hideChoices(1);
    }
  };

  // clears out choices
  var hideChoices = function(player) {
    $('#p' + player).html('<div></div>');
  };

  // displays all choices
  var displayChoices = function(player) {
    $('#p' + player).html(
      '<div class="choice" id="rock"><img src="assets/images/RPS-Rock.png" alt="" /></div><div class="choice" id="paper"><img src="assets/images/RPS-Paper.png" alt="" /></div><div class="choice" id="scissors"><img src="assets/images/RPS-Scissors.png" alt="" /></div>'
    );
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

  // player 1 click handler
  $('#p1').on('click', '.choice', function() {
    if (p1 && p2 && yourPlayerName == p1.name && turn == 1) {
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

  // player 2 click handler
  $('#p2').on('click', '.choice', function() {
    if (p1 && p2 && yourPlayerName == p2.name && turn == 2) {
      choice = $(this).attr('id');

      database
        .ref()
        .child('/players/p2/choice')
        .set(choice);

      checkGame();
    }
  });

  // show game result
  var getOutcome = function() {
    database.ref('/outcome').on('value', function(snapshot) {
      if (!snapshot.val()) {
        $('.game-message').text('Start your move!');
      } else {
        $('.game-message').text(snapshot.val());
      }
    });
  };

  // check the game status and record the result to the database
  function checkGame() {
    if (p1.choice == p2.choice) {
      database
        .ref()
        .child('/players/p1/tie')
        .set(p1.tie + 1);
      database
        .ref()
        .child('/players/p2/tie')
        .set(p2.tie + 1);

      database
        .ref()
        .child('/outcome')
        .set('Tie!');
    } else if (
      (p1.choice == 'rock' && p2.choice == 'scissors') ||
      (p1.choice == 'paper' && p2.choice == 'rock') ||
      (p1.choice == 'scissors' && p2.choice == 'paper')
    ) {
      database
        .ref()
        .child('/players/p1/win')
        .set(p1.win + 1);
      database
        .ref()
        .child('/players/p2/loss')
        .set(p2.loss + 1);

      database
        .ref()
        .child('/outcome')
        .set(p1.choice + ' win!');
    } else {
      database
        .ref()
        .child('/players/p1/loss')
        .set(p1.loss + 1);
      database
        .ref()
        .child('/players/p2/win')
        .set(p2.win + 1);

      database
        .ref()
        .child('/outcome')
        .set(p2.choice + ' win!');
    }

    setTimeout(function() {
      turn = 1;

      database
        .ref()
        .child('/turn')
        .set(turn);
    }, 3000);
  }

  getPlayers();
  getTurn();
  getOutcome();
});
