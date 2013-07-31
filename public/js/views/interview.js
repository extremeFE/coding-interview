// Filename: views/interview
define([
  'jquery',
  'underscore',
  'backbone',
  'bootstrap',
  'collections/interview',
  'text!/templates/interview.html'
], function($, _, Backbone, Bootstrap, interviewCollection, interviewTemplate) {
  var InterviewView = Backbone.View.extend({
    el: $('#container'),
    initialize: function (data) {
      this.queryStirng = data.queryStirng;
    },
    render: function() {
      this.collection = new interviewCollection();
      var that = this;
      this.collection.fetch({
        type:'POST',
        data: this.queryStirng,
        success: function(interview) {
          that.model = interview.models[0];

          var type = that.model.get('type');
          var html = _.template(interviewTemplate, {content: that.model.get('content')});
          that.$el.html(html);
          if (type === 'ADMIN') {
            $('.summernote-save-btn').hide();
          } else {
            $('.summernote-btn-area').remove();
          }
          var editor = ace.edit("editor");
          editor.setTheme("ace/theme/monokai");
          editor.getSession().setMode("ace/mode/javascript");
        }
      });
    },

    events: {
      "click .summernote-edit-btn": "editSummernote",
      "click .summernote-save-btn": "saveSummernote"
    },

    editSummernote : function() {
      $('.summernote').summernote({height: 200, focus: true});
      $('.summernote-edit-btn').hide();
      $('.summernote-save-btn').show();
    },

    saveSummernote : function() {
      var model = this.model;
      var data = {
        id : model.get('id'),
        type : model.get('type'),
        content : $('.summernote').code()[0]
      };

      $.ajax({
        url: '/saveQuestion',
        type: "POST",
        data: $.param(data)
      }).done(function(hResult){
        console.log(hResult);
      });
      $('.summernote').destroy();
      $('.summernote-save-btn').hide();
      $('.summernote-edit-btn').show();
    }
  });

  return InterviewView;
});