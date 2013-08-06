// Filename: views/interview
define([
  'jquery',
  'underscore',
  'backbone',
  'io',
  'ace',
  'collections/interview',
  'text!/templates/interview.html',
  'bootstrap',
  'summernote'
], function($, _, Backbone, io, ace, interviewCollection, interviewTemplate) {
  var InterviewView = Backbone.View.extend({
    el: $('#container'),
    initialize: function (data) {
      this.queryStirng = data.queryStirng;
      this.socket = io.connect('http://localhost');
      this.socket.on('updateQuestion', _.bind(this.updateQuestion, this));
      this.socket.on('updateAnswer', _.bind(this.updateAnswer, this));
    },

    // ### updateQuestion
    // > 관리자가 문제를 변경하면 문제영역 내용 변경
    updateQuestion : function(sHTML) {
      $('.summernote').html(sHTML);
    },

    updateAnswer : function(data) {
      if (this.type === 'APPLICANT') {
        return;
      }
      this.aceEditor.setValue(data.answer, -1);
      this.aceEditor.moveCursorToPosition(data.cursorPos);
    },

    render: function() {
      this.collection = new interviewCollection();
      var that = this;
      this.collection.fetch({
        type:'POST',
        data: this.queryStirng,
        success: function(interview) {
          var model = interview.models[0];
          that.id = model.get('id');
          that.type = model.get('type');
          var sHtml = _.template(interviewTemplate, {content: model.get('content'), answer: model.get('answer')});
          that.$el.html(sHtml);

          if (that.type === 'ADMIN') {
            $('.question-save-btn').hide();
          } else {
            $('.question-btn-area').remove();
          }
//console.log(ace)

          that.aceEditor = ace.edit("editor");
          that.aceEditor.setTheme("ace/theme/monokai");
          that.aceEditor.getSession().setMode("ace/mode/javascript");

          if (that.type === 'APPLICANT') {
            that.aceEditor.on("change", _.bind(that.changeAnswer, that));
          } else {
            that.aceEditor.setReadOnly(true);
          }
        }
      });
    },

    changeAnswer : function(e) {
      var data = {
        id : this.id,
        type : this.type,
        answer : this.aceEditor.getValue(),
        cursorPos : this.aceEditor.getCursorPosition()
      };

      this.socket.emit('saveAnswer',data);
    },

    events: {
      "click .question-edit-btn": "editQuestion",
      "click .question-save-btn": "saveQuestion",
      "change #select-lang": "selectLang",
      "change #select-theme": "selectTheme"
    },

    // ### editQuestion
    // > 문제 편집 모드로 변경
    editQuestion : function() {
      $('.summernote').summernote({height: 200, focus: true});
      $('.question-edit-btn').hide();
      $('.question-save-btn').show();
    },

    // ### saveQuestion
    // > 문제 저장
    saveQuestion : function() {
      var data = {
        id : this.id,
        type : this.type,
        content : $('.summernote').code()[0]
      };

      this.socket.emit('saveQuestion',data);

      $('.summernote').destroy();
      $('.question-save-btn').hide();
      $('.question-edit-btn').show();
    },

    // ### selectLange
    // > language 선택
    selectLang : function(e) {
      this.aceEditor.getSession().setMode("ace/mode/" + e.target.value);
    },

    // ### selectTheme
    // > 테마 선택
    selectTheme : function(e) {
      this.aceEditor.setTheme("ace/theme/" + e.target.value);
    }
  });

  return InterviewView;
});