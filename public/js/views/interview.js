// Filename: views/interview
define([
  'jquery',
  'underscore',
  'backbone',
  'collections/interview',
  'text!/templates/interview.html'
], function($, _, Backbone, interviewCollection, interviewTemplate) {
  var InterviewView = Backbone.View.extend({
    el: $('#container'),
    render: function() {
      this.collection = new interviewCollection();
      var that = this;
      this.collection.fetch({
        success: function(interview) {
          var html = _.template(interviewTemplate, {interviews: interview.models});
          that.$el.html(html);
          var editor = ace.edit("editor");
          editor.setTheme("ace/theme/monokai");
          editor.getSession().setMode("ace/mode/javascript");
        }
      });

    }
  });

  return InterviewView;
});