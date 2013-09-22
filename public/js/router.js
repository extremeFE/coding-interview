// Filename: router.js
define([
  'jquery',
  'underscore',
  'backbone',
  'views/interview',
  'views/home',
  'views/invite'
], function($, _, Backbone, InterviewView, HomeView, InviteView) {

  var AppRouter = Backbone.Router.extend({
    routes: {
      // Define some URL routes
      'interview': 'showInterview',
      'interview/?*queryString': 'showInterview',
      'invite': 'showInvite',
      'invite/?*queryString': 'showInvite',

      // Default
      '*actions': 'defaultAction'
    }
  });

  var initialize = function() {

    var app_router = new AppRouter;

    app_router.on('route:showInterview', function(queryString){
      var interviewView = new InterviewView({queryStirng:queryString});
      interviewView.render();
    });

    app_router.on('route:defaultAction', function () {
      // We have no matching route, lets display the home page
      var homeView = new HomeView();
      homeView.render();
    });

    app_router.on('route:showInvite', function (queryString) {
      var inviteView = new InviteView({queryStirng:queryString});
      inviteView.render();
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
