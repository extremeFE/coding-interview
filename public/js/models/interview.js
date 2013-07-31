// Filename: models/interview
define([
  'underscore',
  'backbone'
], function(_, Backbone) {
  var InterviewModel = Backbone.Model.extend({
    defaults: {
      content: "",
      type:""
    }, url: '/interview'
  });

  return InterviewModel
});