// Filename: views/interview
define([
  'jquery',
  'underscore',
  'backbone',
  'text!/templates/home.html'
], function($, _, Backbone, homeTemplate) {
  var InterviewView = Backbone.View.extend({
    el: $('#container'),
    render: function() {
      this.$el.html(homeTemplate);
    },
    events: {
      "click #create": "createInterview"
    },
    createInterview : function() {
      var welEmail = $('#email');
      console.log(welEmail.val())
    }
  });

  return InterviewView;
});