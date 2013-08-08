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
      this.socket.on('updateChat', _.bind(this.updateChat, this));
    },

    // ### updateQuestion
    // > 관리자가 문제를 변경하면 문제영역 내용 변경
    updateQuestion : function(sHTML) {
      $('.summernote').html(sHTML);
    },

    // ### updateAnswer
    // > 지원자가 코딩을 하면 관리자와 면접관의 코딩 영역 내용 변경
    updateAnswer : function(data) {
      if (this.type === 'APPLICANT') {
        return;
      }
      this.aceEditor.setValue(data.answer, -1);
      this.aceEditor.moveCursorToPosition(data.cursorPos);
    },

    // ### updateChat
    // > 채팅 내용 update
    updateChat : function(data) {
      var welNew = $('<div><b>'+data.username + ':</b> ' + data.chat + '</div>');
      $('#chat-area').append(welNew);
      welNew[0].scrollIntoView();
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

          that.socket.emit('addUser',{type:that.type});

          var sHtml = _.template(interviewTemplate, {content: model.get('content'), answer: model.get('answer')});
          that.$el.html(sHtml);

          if (that.type === 'ADMIN') {
            $('.question-save-btn').hide();
          } else {
            $('.question-btn-area').remove();
          }

          that.aceEditor = ace.edit("editor");
          that.aceEditor.setTheme("ace/theme/monokai");
          that.aceEditor.getSession().setMode("ace/mode/javascript");

          if (that.type === 'APPLICANT') {
            that.aceEditor.on("change", _.bind(that.changeAnswer, that));
          } else {
            that.aceEditor.setReadOnly(true);
          }

          that.aceEditor.on("changeSelection", _.bind(that.viewSelectionRange, that));
        }
      });
    },

    // ### changeAnswer
    // > 코딩
    changeAnswer : function(e) {
      var data = {
        id : this.id,
        type : this.type,
        answer : this.aceEditor.getValue(),
        cursorPos : this.aceEditor.getCursorPosition()
      };

      this.socket.emit('saveAnswer',data);
    },

    viewSelectionRange : function(e) {
      var oSelection = this.aceEditor.getSelection(),
          start = {row:oSelection.selectionAnchor.row, column:oSelection.selectionAnchor.column},
          end = {row:oSelection.selectionLead.row, column:oSelection.selectionLead.column};

      this.range = {start:start, end:end};
      var view = (start.row+1)+':'+start.column+'-'+(end.row+1)+':'+end.column;
      $('#range-info').html(view);
    },

    events: {
      "click .question-edit-btn": "editQuestion",
      "click .question-save-btn": "saveQuestion",
      "change #select-lang": "selectLang",
      "change #select-theme": "selectTheme",
      "click #send-range-link": "sendRangeLink",
      "click #chat-area": "changeSelection",
      "keydown #chat": 'sendChat'
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
    },

    sendRangeLink : function() {
      if (!this.range) {
        return;
      }
      var start = this.range.start,
          end = this.range.end,
          view = (start.row+1)+':'+start.column+'-'+(end.row+1)+':'+end.column,
          chat = _.template('<span class="range-link" data-start-row="<%=start.row %>" data-start-column="<%=start.column %>" data-end-row="<%=end.row %>" data-end-column="<%=end.column %>"><%=view%></span>',
          {start: start, end:end, view:view});

      this.socket.emit('sendChat',{chat:chat});
    },

    changeSelection : function(e) {
      var wel = $(e.target);
      if (!wel.hasClass('range-link')) {
        return;
      }

      var start = {row:wel.attr('data-start-row'), column:wel.attr('data-start-column')};
      var end = {row:wel.attr('data-end-row'), column:wel.attr('data-end-column')};
      console.log(start, end)
    },

    // ### sendChat
    // > 채팅 내용 전송
    sendChat : function(e) {
      var value = $('#chat').val();
      if (e.keyCode !== 13 || !value) {
        return;
      }

      this.socket.emit('sendChat',{chat:value});
      $('#chat').val('');
    }
  });

  return InterviewView;
});