"use strict";

if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define([], function() {
  return  {
    MEM_ADMIN : 0,
    MEM_INTERVIEWER : 1,
    MEM_APPLICANT : 2,
    MEM_NAME : ['관리자', '면접관', '지원자'],
    MEM_CLASS : ['admin', 'interviewer', 'applicant']
  };
});