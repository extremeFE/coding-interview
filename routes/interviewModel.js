var mongoose = require('mongoose');
var mySchema = mongoose.Schema({ state: String, adminKey: String, interviewerKey: String, applicantKey: String, content: String , answer: String, memo: Array});

var uri = 'mongodb://codinginterview:password@dharma.mongohq.com:10005/CodingInterview';
var db = mongoose.createConnection(uri);

module.exports = db.model('interviews', mySchema);