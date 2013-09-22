// Filename: views/interview
define([
  'jquery',
  'underscore',
  'backbone',
  'text!/templates/home.html',
  'text!/templates/invite.html'
], function($, _, Backbone, homeTemplate, createdTemplate) {
  var Home = Backbone.View.extend({
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
        data: 'mail='+welEmail.val()
      }).done(function(hResult){
        location.href = '/#/invite/?id='+hResult._id+'&type='+hResult.adminKey;
      });
    }
  });

  return Home;
});