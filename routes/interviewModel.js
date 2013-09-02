var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mySchema = Schema({ adminKey: String, interviewerKey: String, applicantKey: String, content: String , answer: String});

var uri = 'mongodb://codinginterview:password@dharma.mongohq.com:10005/CodingInterview';
var mySchema = Schema({ adminKey: String, interviewerKey: String, applicantKey: String, content: String , answer: String, memo: Array});
var db = mongoose.createConnection(uri);

module.exports = db.model('interviews', mySchema);