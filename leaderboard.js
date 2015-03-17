PlayersList = new Mongo.Collection('players');

if (Meteor.isClient) {
  Meteor.subscribe('thePlayers');
  Template.leaderboard.helpers({
    'player': function() {
      var currentUserId = Meteor.userId();
      return PlayersList.find({}, {sort: {score: -1, name: 1}});
    },
    'total': function() {
      var currentUserId = Meteor.userId();
      return PlayersList.find({createdBy: currentUserId}).count();
    },
    'selectedClass': function() {
      var playerId = this._id;
      var selectedPlayer = Session.get('selectedPlayer');
      if (playerId == selectedPlayer) {
        return "selected";
      }
    },
    'showSelectedPlayer': function() {
      var selectedPlayer = Session.get('selectedPlayer');
      return PlayersList.findOne(selectedPlayer);
    }
  });
  Template.leaderboard.events({
    'click .player': function(){
      var playerId = this._id; 
      Session.set('selectedPlayer', playerId);
    },
    'click .increment': function() {
      var selectedPlayer = Session.get('selectedPlayer');
      Meteor.call('modifyPlayerScore', selectedPlayer, 5);
    },
    'click .decrement': function() {
      var selectedPlayer = Session.get('selectedPlayer');
      Meteor.call('modifyPlayerScore', selectedPlayer, -5);
    },
    'click .reset': function() {
      var selectedPlayer = Session.get('selectedPlayer');
      Meteor.call('resetPlayerScore', selectedPlayer);
    },
    'submit form': function() {
      event.preventDefault();
      var playerNameVar = event.target.playerName.value;
      Meteor.call('insertPlayerData', playerNameVar);
      document.getElementById('myForm').reset();
    }
    ,
    'click .remove': function() {
      var selectedPlayer = Session.get('selectedPlayer');
      if (confirm("Please confirm that you want this player removed.")) {
        Meteor.call('removePlayerData', selectedPlayer);
      }
    }
  }); 
}
if (Meteor.isServer) {
  Meteor.methods({
    'insertPlayerData': function(playerNameVar) {
      var currentUserId = Meteor.userId();
      PlayersList.insert({
        name: playerNameVar,
        score: 0,
        createdBy: currentUserId
      });
    },
    'removePlayerData': function(selectedPlayer) {
      PlayersList.remove(selectedPlayer);
    },
    'modifyPlayerScore': function(selectedPlayer, scoreValue) {
      PlayersList.update(selectedPlayer, {$inc: {score: scoreValue}});
    },
    'resetPlayerScore': function(selectedPlayer) {
      PlayersList.update(selectedPlayer, {$set: {score: 0}});
    }
  });
  Meteor.publish('thePlayers', function() {
    var currentUserId = this.userId;
    return PlayersList.find({createdBy: currentUserId});
  });
}