// Filename: main.js // Require.js allows us to configure shortcut alias
// There usage will become more apparent further along in the tutorial.

require.config({
  paths: {
    jquery: 'libs/jquery',
    underscore: 'libs/underscore',
    backbone: 'libs/backbone',
    bootstrap: '../lib/bootstrap/js/bootstrap.min'
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
    "bootstrap": {
      deps: ["jquery"],
      exports: "Bootstrap"
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