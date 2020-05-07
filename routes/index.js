var express = require('express');
var router = express.Router();
var mongoose=require('mongoose');
var http=require('http');

mongoose.connect('mongodb://127.0.0.1:27017/blog',function (err) {
    if (err){
      throw err;
    }
    else{
      console.log('database in running...');
    }
})

var mongoSchema=new mongoose.Schema({
    title:String,
    classify:String,
    author:String,
    content:String
})

//定义用户骨架
var contentSchema=new mongoose.Schema({
	content:String
});
//通过骨架发布模型conModel
var conModel=mongoose.model('user',contentSchema,'user');
//new一个实体listMode
router.post('/save_content.html',function(req,res){
	var listModel=new conModel();
	var data=req.body['con[]'];
	var content=data;
	console.log(data);
	listModel.content=content;
	listModel.save(function(data){
//				console.log(data);
				res.send('1');
	})
});


router.post('/show.html',function(req,res){
	conModel.find({}).exec(function(err,data){
		if(err){
			throw error;
		}else{
			res.send(data);
		}
	});
});

var essaymodel=mongoose.model('essay',mongoSchema,'release');

router.post('release.php',function (req,res) {
   essaymodel.find({}).exec(function (err,data) {
       if(err){
           throw err;
       }
       else{
           res.send(data);
       }
   })

})



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
