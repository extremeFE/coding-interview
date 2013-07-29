// Filename: router.js
define([
  'jquery',
  'underscore',
  'backbone',
  'views/interview',
  'views/home'
], function($, _, Backbone, InterviewView, HomeView) {

  var AppRouter = Backbone.Router.extend({
    routes: {
      // Define some URL routes
      'interview': 'showInterview',
      'interview/?*queryString': 'showInterview',

      // Default
      '*actions': 'defaultAction'
    }
  });

  var parseQueryString = function(queryString){
    var params = {};
    if(queryString){
      _.each(
        _.map(decodeURI(queryString).split(/&/g),function(el,i){
          var aux = el.split('='), o = {};
          if(aux.length >= 1){
            var val = undefined;
            if(aux.length == 2)
              val = aux[1];
            o[aux[0]] = val;
          }
          return o;
        }),
        function(o){
          _.extend(params,o);
        }
      );
    }
    return params;
  }

  var initialize = function(){

    var app_router = new AppRouter;

    app_router.on('route:showInterview', function(queryString){
      var hParam = parseQueryString(queryString);
//      console.log(hParam)
      // Call render on the module we loaded in via the dependency array
      var interviewView = new InterviewView();
      interviewView.render();

    });

    app_router.on('route:defaultAction', function () {
      // We have no matching route, lets display the home page
      var homeView = new HomeView();
      homeView.render();
    });

    // Unlike the above, we don't call render on this view as it will handle
    // the render call internally after it loads data. Further more we load it
    // outside of an on-route function to have it loaded no matter which page is
    // loaded initially.
//    var footerView = new FooterView();

    Backbone.history.start();
  };
  return {
    initialize: initialize
  };
});
