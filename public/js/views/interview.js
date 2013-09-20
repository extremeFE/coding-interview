// Filename: views/interview
define([
  'jquery',
  'underscore',
  'backbone',
  'io',
  'ace',
  'share/const',
  'collections/interview',
  'text!/templates/interview.html',
  'text!/templates/memo.html',
  'bootstrap',
  'summernote'
], function($, _, Backbone, io, ace, cnst, interviewCollection, interviewTemplate, memoTemplate) {
  var addMemoTemplate = '<div class="memo-add"><textarea></textarea><div class="memo-add-btn-area"><i class="memo-cancel icon-ban-circle" title="취소"></i><i class="memo-save icon-save" title="저장"></i></div></div>';
  var LINE_HEIGHT = 16;
  var PREFIX_ID = 'memo-layer-';
  var InterviewView = Backbone.View.extend({
    el: $('#container'),
    initialize: function (data) {
      this.queryStirng = data.queryStirng;
      this.socket = io.connect('http://localhost');
      this.socket.on('updateQuestion', _.bind(this.updateQuestion, this));
      this.socket.on('updateAnswer', _.bind(this.updateAnswer, this));
      this.socket.on('updateChat', _.bind(this.updateChat, this));
      this.socket.on('addedLine', _.bind(this.addedLine, this));
      this.socket.on('removedLines', _.bind(this.removedLines, this));
      this.socket.on('updateMemo', _.bind(this.updateMemo, this));
      this.socket.on('startEstimation', _.bind(this.startEstimation, this));
      this.socket.on('endInterview', _.bind(this.endInterview, this));
      this.socket.on('updateUserList', _.bind(this.updateUserList, this));
    },

    // ### updateQuestion
    // > 관리자가 문제를 변경하면 문제영역 내용 변경
    updateQuestion : function(data) {
      $('.summernote').html(data.sHTML);
      if (data.state) {
        this.changeStateView(data.state);
      }
    },

    // ### updateAnswer
    // > 지원자가 코딩을 하면 관리자와 면접관의 코딩 영역 내용 변경
    updateAnswer : function(data) {
      if (this.type === cnst.MEM_APPLICANT) {
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

    updateLayerInfo : function(welLayer, row) {
      welLayer.attr('id', PREFIX_ID+row);
      welLayer.attr('data-row', row);
      welLayer.removeClass('select');
      welLayer.css('top',row*LINE_HEIGHT);
    },

    // ### addedLine
    addedLine : function(data) {
      // 기존 메모 레이어 라인 증가
      var aAddLineLayer = _.filter($('.memo-layer'), function(elLayer) {
        return data.startRow <= parseInt($(elLayer).attr('data-row'));
      });

      _.each(aAddLineLayer, function(elLayer) {
        var welLayer = $(elLayer);
        var row = parseInt(welLayer.attr('data-row')) + 1;
        this.updateLayerInfo(welLayer, row);
      }, this);

      // 신규 메모 레이어 추가
      $('#memo-layer-area').html($('#memo-layer-area').html()+this.getMemoLayerHtml([], data.startRow));
      this.viewSelectionRange();
    },

    // ### removedLines
    removedLines : function(data) {
      var aMemoLayer = $('.memo-layer'),
          startRow = data.startRow,
          endRow = data.startRow+data.lineLen;

      // 삭제 라인 메모 제거
      var aRemoveLineLayer = _.filter(aMemoLayer, function(elLayer) {
        var row = parseInt($(elLayer).attr('data-row'));
        return startRow <= row && endRow >= row;
      });
      _.each(aRemoveLineLayer, function(elLayer) {
        $(elLayer).remove();
      });

      // 삭제 라인 하위 메모 레이어 라인 변경
      var aMinusLineLayer = _.filter(aMemoLayer, function(elLayer) {
        var row = parseInt($(elLayer).attr('data-row'));
        return endRow+1 <= row;
      });
      _.each(aMinusLineLayer, function(elLayer) {
        var welLayer = $(elLayer),
            row = parseInt(welLayer.attr('data-row'))-data.lineLen;
        this.updateLayerInfo(welLayer, row);
      }, this);
    },

    // ### updateMemo
    updateMemo : function(data) {
      var welLayer = $('#'+PREFIX_ID+data.row);
      var html = this.getMemoLayerHtml(data.memo, data.row);
      var welTmp = $(html);
      welLayer.html(welTmp[0].innerHTML);
      welLayer.attr('data-count', welTmp.attr('data-count'));
      if (data.memo.length > 0) {
        welLayer.removeClass('insert');
      } else  {
        welLayer.removeClass('expand');
        welLayer.addClass('insert');
      }
    },

    // 평가 시작
    startEstimation : function(state) {
      this.$el.addClass('estimation');
      state = state || 'ESTIMATION';

      if (state === 'END') {
        this.$el.addClass('end');
      }
      this.changeStateView(state);

      var elCodeArea = $('#code-area');
      var elThemeArea = $('#editor-theme-area');
      elCodeArea.removeClass('span12');
      elCodeArea.addClass('span9');

      elThemeArea.removeClass('span9');
      elThemeArea.addClass('span6');
      this.aceEditor.setReadOnly(true);
    },

    // 인터뷰 종료
    endInterview : function() {
      this.$el.addClass('end');
      if (this.type === cnst.MEM_APPLICANT) {
        this.$el.html("인터뷰가 종료되었습니다.");
      } else {
        this.changeStateView('END');
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
          that.socket.emit('addUser',{id:that.id, type:that.type});

          var state = model.get('state');
          if (that.type === cnst.MEM_APPLICANT && state === 'END') {
            that.endInterview();
            return;
          }

          var sHtml = _.template(interviewTemplate, {content: model.get('content'), answer: model.get('answer'), type:cnst.MEM_NAME[that.type]});
          that.$el.addClass(cnst.MEM_CLASS[that.type]);
          that.$el.html(sHtml);

          that.changeStateView(state);

          if (that.type === cnst.MEM_ADMIN) {
            $('.question-save-btn').hide();
          } else {
            $('.question-btn-area').remove();
          }

          that.aceEditor = ace.edit("editor");
          that.aceEditor.setTheme("ace/theme/monokai");
          that.aceEditor.getSession().setMode("ace/mode/javascript");

          if (that.type === cnst.MEM_APPLICANT) {
            that.aceEditor.on("change", _.bind(that.changeAnswer, that));
          } else {
            that.aceEditor.setReadOnly(true);
          }

          that.aceEditor.on("changeSelection", _.bind(that.viewSelectionRange, that));
          that.aceRange = ace.require("./range").Range;

          setTimeout(function() {
            that.memo.length = that.aceEditor.getLastVisibleRow() + 1;
            that.renderMemo(that.memo);

            if (state === 'ESTIMATION' || state === 'END') {
              that.startEstimation(state);
            }
          }, 100);
        }
      });
    },

    changeStateView : function(state) {
      var index = cnst.STATE_INDEX[state];
      _.each($('#state-area .label'), function(el, i) {
        el.className = i===index ? 'label label-info' : 'label';
      });
    },

    getMemoLayerHtml : function(memo, row) {
      var sMemoList = '';
      var view = '+';
      var count = 0;
      var addClass = 'insert';
      if (memo && memo.length > 0) {
        view = count = memo.length;
        addClass = 'expand';
        sMemoList += _.map(memo, function(memoData) {
          if (!memoData) { return ''}
          return '<div class="memo-content" data-memoid="'+memoData.memoId+'"><div class="content">'+memoData.memo+'</div><div class="memo-edit-btn-area"><i class="memo-remove-btn icon-remove-sign" title="삭제"></i><i class="memo-edit-btn icon-edit" title="수정"></i></div></div>';
        }).join('');
        sMemoList += '<div class="memo-add-btn-area"><i class="memo-add-btn icon-plus-sign-alt" title="메모 추가"></i></div>';
      }
      sMemoList += addMemoTemplate;
      return _.template(memoTemplate, {row:row, count:count, top:row*LINE_HEIGHT, addClass:addClass, view:view, list:sMemoList});
    },

    renderMemo : function(aMemo){
      var sHtml = '';
      for(var i=0; i<aMemo.length; i++) {
        sHtml += this.getMemoLayerHtml(aMemo[i], i);
      }
      $('#memo-layer-area').html(sHtml);
    },

    // ### changeAnswer
    // > 코딩
    changeAnswer : function(e) {
      var memoData;
      if (e.data.action === 'insertText' && e.data.text === '\n') {
        $('#'+PREFIX_ID+e.data.range.start.row-1).removeClass('select');
        memoData = {startRow: e.data.range.start.row, updateType:'addLine'};
      } else if (e.data.action === 'removeText' && e.data.text === '\n') {
        memoData = {startRow: e.data.range.start.row+1, updateType:'removeLines', lineLen: 1};
      } else if (e.data.action === 'removeLines') {
        memoData = {startRow: e.data.range.start.row+1, updateType:'removeLines', lineLen: e.data.lines.length};
      }
      var data = {
        id : this.id,
        type : this.type,
        answer : this.aceEditor.getValue(),
        cursorPos : this.aceEditor.getCursorPosition(),
        memoData : memoData
      };

      this.socket.emit('saveAnswer',data);
    },

    // ### viewSelectionRange
    // range 정보 표시하기
    viewSelectionRange : function() {
      if (this.selectedMemoLayer) {
        this.selectedMemoLayer.removeClass('select');
      }
      var range = this.range = this.aceEditor.getSelectionRange();
      var welLayer = $('#'+PREFIX_ID+range.start.row);
      welLayer.addClass('select');
      $('#range-info').html((range.start.row+1)+':'+range.start.column+'-'+(range.end.row+1)+':'+range.end.column);
      this.selectedMemoLayer = welLayer;
    },

    events: {
      "click .question-edit-btn": "editQuestion",
      "click .question-save-btn": "saveQuestion",
      "change #select-lang": "selectLang",
      "change #select-theme": "selectTheme",
      "click #send-range-link-btn": "sendRangeLink",
      "click #chat-collapse": "collapseChat",
      "click #chat-bar": "expandChat",
      "click #chat-area": "selectRangeLink",
      "keydown #chat": 'sendChat',
      "click #memo-area": "clickMemoArea",
      "click #finish-coding-btn": "finishCoding",
      "click #finish-interview-btn": "finishInterview"
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

    // ### collapseChat
    // > 채팅 레이어 접기
    collapseChat : function() {
      $('#chat-layer').addClass('collapsed');
    },

    // ### expandChat
    // > 채팅 레이어 펼치기
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
    },

    clickMemoArea : function(e) {
      var welLayer = $(e.target).parents(".memo-layer");
      if (!welLayer) {
        return;
      }
      var id = this.id;
      var welTarget = $(e.target);
      var welIcon = welTarget.parents(".memo-icon");
      var welContent = welTarget.parents(".memo-content");
      var memoCount = parseInt(welLayer.attr('data-count'));
      var row = parseInt(welLayer.attr('data-row'));
      if (welIcon.length > 0) {
        var range = new this.aceRange(row, 0, row, 0);
        var selection = this.aceEditor.getSelection();
        selection.setSelectionRange(range);
        selection.selectLine();
        if (memoCount === 0) {
          welLayer.toggleClass('expand');
        }
      } else if (welTarget.hasClass('memo-add-btn')) {
        welLayer.addClass('insert');
      } else if (welTarget.hasClass('memo-edit-btn')) {
        var content = welContent.find('.content').html();
        welContent.addClass('edit');
        welContent.html(welContent.html()+addMemoTemplate);
        welContent.find('textarea').val(content);
        welLayer.removeClass('insert');
      } else if (welTarget.hasClass('memo-remove-btn')) {
        var data = {
          id: id,
          row: row,
          updateType: 'delete',
          memoData: {
            memoId: welContent.attr('data-memoid')
          }
        };
        this.socket.emit('sendMemo',data);
      } else if (welTarget.hasClass('memo-save')) {
        var data = {
          id: id,
          row: row,
          memoData: {
            memo: welLayer.find('textarea')[0].value,
            userId: 'test'
          }
        };
        if (welContent.length > 0) {
          data.updateType = 'update';
          data.memoData.memoId = welContent.attr('data-memoid');
        } else  {
          data.updateType = 'insert';
        }
        this.socket.emit('sendMemo',data);
      } else if (welTarget.hasClass('memo-cancel')) {
        if (welContent.length > 0) {
          welContent.find('.memo-add').remove();
          welContent.removeClass('edit');
        } else if (memoCount === 0) {
          welLayer.removeClass('expand');
        } else {
          welLayer.removeClass('insert');
        }
        welLayer.find('textarea').val('');
      }
    },

    finishCoding : function() {
      var id = this.id;
      this.socket.emit('finishCoding',{id:id});
    },

    finishInterview : function() {
      var id = this.id;
      this.socket.emit('finishInterview',{id:id});
    }
  });

  return InterviewView;
});