// Filename: collections/invite
define([
  'underscore',
  'backbone',
  'models/interview'
], function(_, Backbone, InterviewModel) {
  var InviteCollection = Backbone.Collection.extend({
    model: InterviewModel,
    url: '/invite'
  });

  return InviteCollection;
});