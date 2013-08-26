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

      if ($('#chat-layer').hasClass('collapsed')) {
        this.chatBarBlink = setInterval(function() {
          $('#chat-bar').toggleClass('blink');
        }, 1000);
      } else {
        welNew[0].scrollIntoView();
      }
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
          that.memo = model.get('memo');

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
          that.aceRange = ace.require("./range").Range;

          setTimeout(function() {
            that.memo.length = that.aceEditor.getLastVisibleRow() + 1;
            that.renderMemo(that.memo);
          }, 100);
        }
      });
    },

    renderMemo : function(aMemo){
      var sAddHtml = '<div id="memo-layer-<%= i %>" class="memo-layer" style="top:<%= top %>px"> <div class="memo-icon add"><span>+</span></div> </div>';
      var sHtml = "";
      for (var i=0; i < aMemo.length; i++) {
        var memo = aMemo[i];
        sHtml += _.template(sAddHtml, {i:i, top:i*16})
      }
      $('#memo-layer-area').html(sHtml);
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

    // ### viewSelectionRange
    // range 정보 표시하기
    viewSelectionRange : function(e) {
      if (this.selectedLine !== undefined) {
        $('#memo-layer-'+this.selectedLine).removeClass('select');
      }
      var range = this.range = this.aceEditor.getSelectionRange();
      this.selectedLine = range.start.row;
      $('#memo-layer-'+range.start.row).addClass('select');
      $('#range-info').html((range.start.row+1)+':'+range.start.column+'-'+(range.end.row+1)+':'+range.end.column);
    },

    events: {
      "click .question-edit-btn": "editQuestion",
      "click .question-save-btn": "saveQuestion",
      "change #select-lang": "selectLang",
      "change #select-theme": "selectTheme",
      "click #send-range-link": "sendRangeLink",
      "click #chat-collapse": "collapseChat",
      "click #chat-bar": "expandChat",
      "click #chat-area": "selectRangeLink",
      "keydown #chat": 'sendChat'
    },

    // ### editQuestion
    // > 문제 편집 모드로 변경
    editQuestion : function() {
      $('.summernote').summernote({height: 132, focus: true});
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

    collapseChat : function() {
      $('#chat-layer').addClass('collapsed');
    },

    expandChat : function(e) {
      if (e.target.id !== 'chat-collapse' && $('#chat-layer').hasClass('collapsed')) {
        $('#chat-layer').removeClass('collapsed');
        clearInterval(this.chatBarBlink);
        $('#chat-bar').removeClass('blink');
        $('#chat').focus();
      }
    },

    // ### sendRangeLink
    // > range 링크 정보 전송
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

    // ### selectRangeLink
    // range link 정보로 selection 변경하기
    selectRangeLink : function(e) {
      var wel = $(e.target);
      if (!wel.hasClass('range-link')) {
        return;
      }

      var range = new this.aceRange(parseInt(wel.attr('data-start-row')), parseInt(wel.attr('data-start-column')),
                          parseInt(wel.attr('data-end-row')), parseInt(wel.attr('data-end-column')));
      this.aceEditor.getSelection().setSelectionRange(range);
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