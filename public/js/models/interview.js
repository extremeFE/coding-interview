// Filename: models/interview
define([
  'underscore',
  'backbone'
], function(_, Backbone) {
  var InterviewModel = Backbone.Model.extend({
    defaults: {
      content: "",
      answer: "",
      type:""
    }, url: '/interview'
  });

  return InterviewModel
});