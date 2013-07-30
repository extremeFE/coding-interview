var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mySchema = Schema({ adminKey: String, interviewerKey: String, applicantKey: String, content: String });

var uri = 'mongodb://codinginterview:password@dharma.mongohq.com:10005/CodingInterview';
var db = mongoose.createConnection(uri);

module.exports = db.model('question', mySchema);