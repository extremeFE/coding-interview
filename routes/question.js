
/*
 * question.
 */

var mongo = require('mongodb');
var title = "1부터 1000까지 영어로 썼을 때 사용된 글자의 개수는?";
var content = '<p style="color: rgb(0, 0, 0); font-family: 맑은 고딕, 돋움, Trebuchet MS, sans-serif; font-size: 16px; font-style: normal; font-variant: normal; font-weight: normal; letter-spacing: normal; line-height: normal; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: auto; word-spacing: 0px; -webkit-text-stroke-width: 0px;"> <span>1부터 5까지의 숫자를 영어로 쓰면</span> <span class="Apple-converted-space">&nbsp;</span> <var style="font-family: times new roman; font-style: italic; font-size: 19px;">one, two, three, four, five</var> <span class="Apple-converted-space">&nbsp;</span> <span>이고,</span> <br> <span>각 단어의 길이를 더하면 3 + 3 + 5 + 4 + 4 = 19 이므로 사용된 글자는 모두 19개입니다.</span> </p> <p style="color: rgb(0, 0, 0); font-family: 맑은 고딕, 돋움, Trebuchet MS, sans-serif; font-size: 16px; font-style: normal; font-variant: normal; font-weight: normal; letter-spacing: normal; line-height: normal; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: auto; word-spacing: 0px; -webkit-text-stroke-width: 0px;"> <span>1부터 1,000까지 영어로 썼을 때는 모두 몇 개의 글자를 사용해야 할까요?</span> </p> <p style="color: rgb(0, 0, 0); font-family: 맑은 고딕, 돋움, Trebuchet MS, sans-serif; font-size: 16px; font-style: normal; font-variant: normal; font-weight: normal; letter-spacing: normal; line-height: normal; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: auto; word-spacing: 0px; -webkit-text-stroke-width: 0px;"> <strong>참고:</strong> <span>&nbsp;빈 칸이나 하이픈(-)은 셈에서 제외하며,&nbsp;단어 사이의</span> <span class="Apple-converted-space">&nbsp;</span> <var style="font-family: times new roman; font-style: italic; font-size: 19px;">and</var> <span class="Apple-converted-space">&nbsp;</span> <span>는 셈에 넣습니다.</span> <br> <span>&nbsp; 예를 들어 342를 영어로 쓰면</span> <span class="Apple-converted-space">&nbsp;</span> <var style="font-family: times new roman; font-style: italic; font-size: 19px;">three hundred and forty-two</var> <span class="Apple-converted-space">&nbsp;</span> <span>가 되어서 23 글자,</span> <br> <span>&nbsp; 115 =</span> <span class="Apple-converted-space">&nbsp;</span> <var style="font-family: times new roman; font-style: italic; font-size: 19px;">one hundred and fifteen</var> <span class="Apple-converted-space">&nbsp;</span> <span>의 경우에는 20 글자가 됩니다.</span> </p>';
exports.insertMock = function(req, res){
  var server = new mongo.Server("localhost", 27017);
  var client = new mongo.Db('CodingInterview', server, {w:-1});
  client.open(function(err, client){
    if (err) { throw err; }
    var collection = new mongo.Collection(client, 'question');
    var cursor = collection.find();
    cursor.count(function(err, count){
      var message;
      if (count > 0) {
        client.close();
        message = "Has already been inserted data.";
      } else {
        collection.insert({title: title, content: encodeURIComponent(content)});
        message = "Insert data";
      }
      client.close();
      res.send(message);
    });
  });
};