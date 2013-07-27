// Filename: views/interview
define([
  'jquery',
  'underscore',
  'backbone',
  'text!/templates/home.html',
  'text!/templates/created.html'
], function($, _, Backbone, homeTemplate, createdTemplate) {
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
      this.$el.html(createdTemplate);
    }
  });

  return InterviewView;
});