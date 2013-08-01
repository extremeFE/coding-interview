// Filename: main.js // Require.js allows us to configure shortcut alias
// There usage will become more apparent further along in the tutorial.

require.config({
  paths: {
    jquery: 'libs/jquery',
    underscore: 'libs/underscore',
    backbone: 'libs/backbone',
    io: '../socket.io/socket.io',
    ace: '../lib/ace/ace',
    bootstrap: '../lib/bootstrap/js/bootstrap.min',
    summernote: '../lib/summernote/summernote.min'
  },
  shim: {
    "underscore": {
      deps: [],
      exports: "_"
    },
    "backbone": {
      deps: ["jquery", "underscore"],
      exports: "Backbone"
    },
    "ace": {
      deps: [],
      exports: "ace"
    },
    "bootstrap": {
      deps: ["jquery"],
      exports: "Bootstrap"
    },
    "summernote": {
      deps: ["jquery"],
      exports: "Summernote"
    }
  }
});

require([
  // Load our app module and pass it to our definition function
  'app'
], function(App){
  // The "app" dependency is passed in as "App"
  App.initialize();
});