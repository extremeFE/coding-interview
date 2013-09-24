// Filename: views/interview
define([
  'jquery',
  'underscore',
  'backbone',
  'text!/templates/home.html'
], function($, _, Backbone, homeTemplate) {
  var Home = Backbone.View.extend({
    el: $('#container'),
    render: function() {
      this.$el.html(homeTemplate);
    },

    events: {
      "click #create": "createInterview"
    },

    // ### createInterview
    // > 인터뷰 페이지 생성
    createInterview : function() {
      var welEmail = $('#email');
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