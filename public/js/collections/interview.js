// Filename: collections/interview
define([
  'underscore',
  'backbone',
  'models/interview'
], function(_, Backbone, InterviewModel) {
  var InterviewCollection = Backbone.Collection.extend({
    model: InterviewModel,
    url: '/interview'
  });

  return InterviewCollection;
});