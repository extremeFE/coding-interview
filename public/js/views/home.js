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
      var that = this;
      $.ajax({
        url: '/createInterview',
        type: "POST",
        data:'mail='+welEmail.val()
      }).done(function(hResult){
        var html = _.template(createdTemplate, {interview: hResult});
        that.$el.html(html);
      });
    }
  });

  return InterviewView;
});