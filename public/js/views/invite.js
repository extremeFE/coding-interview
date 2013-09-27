// Filename: views/invite
define([
  'jquery',
  'underscore',
  'backbone',
  'collections/invite',
  'text!/templates/invite.html'
], function($, _, Backbone, inviteCollection, inviteTemplate) {
  var Invite = Backbone.View.extend({
    el: $('#container'),
    initialize: function (data) {
      this.queryStirng = data.queryStirng;
    },
    render: function() {
      var collection = new inviteCollection();
      var that = this;
      collection.fetch({
        type:'POST',
        data: that.queryStirng,
        success: function(interview) {
          var html = '',
              model = interview.models[0],
              id = model.get('id');
          that.id = id;
          if (id) {
            html = _.template(inviteTemplate, {interview: {
              id:id,
              adminKey: model.get('adminKey')
            }});
            that.interviewerKey = model.get('interviewerKey');
            that.applicantKey = model.get('applicantKey');
          } else {
            html = '<div class="alert alert-block">접근 권한이 없습니다.</div>';
          }

          that.$el.html(html);
        }
      });

    },
    events: {
      "click #invite-interviewer": "inviteInterviewer",
      "click #invite-applicant" : "inviteApplicant"
    },

    // ### inviteInterviewer
    // > 면접관 초대 메일 발송
    inviteInterviewer : function() {
      var welEmail = $('#interviewer-email');
      this.invite(welEmail.val(), this.interviewerKey, '코딩 인터뷰에 면접관으로 초대되었습니다.', welEmail);
    },

    // ### inviteInterviewer
    // > 지원자 초대 메일 발송
    inviteApplicant : function() {
      var welEmail = $('#applicant-email');
      this.invite(welEmail.val(), this.applicantKey, '코딩 인터뷰에 지원자로 초대되었습니다.', welEmail);
    },

    // ### invite
    // > 초대 메일 발송
    invite : function(mail, key, content, welEmail) {
      var that = this;
      $.ajax({
        url: '/sendInviteMail',
        type: "POST",
        data: 'id='+this.id+'&mail='+mail+'&locationHost='+window.location.host+'&key='+key+'&content='+content
      }).done(function(hResult){
        welEmail.val('');
        $('#send-modal').modal('show');
      });
    }
  });

  return Invite;
});