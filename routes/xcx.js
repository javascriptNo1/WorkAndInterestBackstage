let express = require('express');
let router = express.Router();
let mongoose=require('mongoose');
const request = require('request');
let formidable = require('formidable');
let path = require('path');
let fs = require('fs');
let os=require('os'); //node的内置模块，不需要安装
let ifaces=os.networkInterfaces(); //用networkInterfaces方法获取网关信息
let address = '';
//循环获取到的网关信息
for (let dev in ifaces) {
  ifaces[dev].forEach(function (details) {
    //找到ipv4地址
    if (details.family === 'IPv4') {
      //127.0.0.1貌似也是ipv4地址的一个，所以需要排除
      if(details.address !== '127.0.0.1'){
        //拿到局域网的ipv4地址
        address = details.address
      }
    }
  });
}
mongoose.connect('mongodb://127.0.0.1:27017/WorkAndInterest',{useNewUrlParser:true},function (err) {
    if (err){
        throw err;
    }
    else{
        console.log('database in running... IP:'+address);
    }
})

// 定义骨(暂时废弃)
let mongoSchema=new mongoose.Schema({
    title:String,
    classify:String,
    allclassify:Array,
    time:String,
    timestamp:Number,
    content:String,
    fabulous:Number,
    options:Array,
    remarks:String,
    userid:String,
    user:String,
    password:String,
    overt:Boolean,
    assets:String,
    collect:Number,
    comment:String,
    collectionlist:Array,
    testPaperlist:Array,
    defaultsubjectovet:Boolean,
    defaulttestpaperovet:Boolean,
    defaultsubjectclassify:Array,
    defaulttestpaperclassify:Array,
    report:Array,
    reportid:String,
    completedsubject:Array,
    completedpapers:Array,
    havefinished:Array,
    havefinishedpaper:Array,
    username:String,
    isaddpaper:Boolean,
    ishavefinishedpaper:Boolean,
    reportsNumber:Number
})

//定义题目骨架
let subjectSchema=new mongoose.Schema({
    title:String,  //标题
    classify:String,//分类
    time:String,//时间
    timestamp:Number,//时间戳
    assets:String, //图片
    options:Array,//选项
    remarks:String,//备注
    userid:String,//用户id
    username:String,//用户昵称
    overt:Boolean,//是否公开
    collect:Number,//收藏数量
    isaddpaper:Boolean,//是否被添加到试卷
    Toexamine:Boolean,//审核是否通过
    reportsNumber:Number,//举报次数
    random:Number,//0-9的随机数，用于随机取出
})
// 发布题目模型
let subjectModel=mongoose.model('subject',subjectSchema,'subject');


// 定义试卷骨架
let testPaperSchema=new mongoose.Schema({
    title:String,//标题
    options:Array,//试题列表
    classify:String,//分类
    userid:String,//用户id
    username:String,//用户昵称
    overt:Boolean,//是否公开
    collect:Number,//收藏数量
    time:String,//时间
    timestamp:Number,//时间戳
    reportsNumber:Number,//举报次数
    random:Number,//0-9的随机数，用于随机取出
})
// 发布试卷模型
let testPaperModel=mongoose.model('testPaper',testPaperSchema,'testPaper');


// 定义个人信息骨架
let collectionSchema=new mongoose.Schema({
    userid:String, //用户id
    username:String,//用户名称
    gender:Number,//用户性别
    collectionlist:Array,//收藏的题目
    testPaperlist:Array,//收藏的试卷
    defaultsubjectovet:Boolean,//定义题目时默认是否公开
    defaulttestpaperovet:Boolean,//定义试卷时默认是否公开
    defaultsubjectclassify:Array,//定义题目的默认分类
    defaulttestpaperclassify:Array,//定义题目的默认分类
    havefinished:Array,//用户已做完的题目
    havefinishedpaper:Array,//用户已做完的试卷
    Numberofreports:Number,//用户的题目和试卷被举报次数
    time:String,//时间
    timestamp:Number,//时间戳
})
// 发布用户个人信息模型，包括收藏单个题目和试卷信息
let collectionModel=mongoose.model('collection',collectionSchema,'collection');

// 定义被举报的题目或试卷骨架
let reportSchema=new mongoose.Schema({
    report:Array, //举报该题目或试卷的用户id
    reportid:String //被举报的题目或试卷id
})
// 发布用于存放被举报的题目和试卷
let reportModel=mongoose.model('report',reportSchema,'report');



// 定义所有的试题和试卷分类骨架
let allclassifySchema=new mongoose.Schema({
    maxclass:String,
    minclass:Array
})
// 发布所有的试题和试卷分类模型
let allclassifyModel=mongoose.model('allclassify',allclassifySchema,'allclassify');


//接收登录请求和用户名密码
router.post("/login.php",function(req,res){
    let code=req.body.code;
    const index=`https://api.weixin.qq.com/sns/jscode2session?appid=wxbebd0f2304a6de7d&secret=8af32c9085791e26cc2a030d5862934b&js_code=${code}&grant_type=authorization_code`;
    const options={
        url: index,
    }
    request(options, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            let openid=JSON.parse(body).openid;
            let session_key=JSON.parse(body).session_key;
            // 初始化用户信息
            collectionModel.find({"userid":openid}).exec(function (err,data) {
                if (!data.length){
                    let collectiondata =new collectionModel();
                    collectiondata.userid = openid
                    collectiondata.username = ''
                    collectiondata.gender = 0
                    collectiondata.collectionlist = []
                    collectiondata.testPaperlist = []
                    collectiondata.defaultsubjectovet = false
                    collectiondata.defaulttestpaperovet = false
                    collectiondata.defaultsubjectclassify = [0,0]
                    collectiondata.defaulttestpaperclassify = [0,0]
                    collectiondata.havefinished = []
                    collectiondata.havefinishedpaper = []
                    collectiondata.Numberofreports = 0
                    collectiondata.time = new Date().toLocaleDateString(); //时间
                    collectiondata.timestamp= Date.parse(new Date()) //时间戳
                    collectiondata.save(function (err) {
                        if(err){
                            res.send("0");
                        }
                        else{
                            res.send(openid)
                        }
                    })
                }
                else {
                    res.send(openid)
                }
            })

        }
        else {
            console.log('出错',error)
        }
    })
})

// 接收用户提交的题目
router.post("/setsubject.php",function(req,res){
    let subject=new subjectModel();
    subject.title = req.body.title;
    subject.options=req.body.options;
    subject.remarks=req.body.remarks;
    subject.classify = req.body.classify;
    subject.assets = req.body.assets;
    subject.userid = req.body.userid;
    subject.username = req.body.username;
    subject.overt = req.body.overt;
    subject.collect = 0;
    subject.isaddpaper = false;
    subject.Toexamine = true;
    subject.time = new Date().toLocaleDateString();
    subject.timestamp = Date.parse(new Date());
    subject.random = Number.parseInt(Math.random()*10);
    subject.save(function (err) {
        if(err){
            res.send("0");
        }
        else{
            res.send('1');
        }
    })
})

//接收用户上传的图片
router.post("/uploadimage",function (req,res) {
    let form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = path.join(__dirname + "/../public/page/upload");
    form.keepExtensions = true;//保留后缀
    form.maxFieldsSize = 2 * 1024 * 1024;
    //处理图片
    form.parse(req, function (err, fields, files){
        let filename = files.file.name
        let nameArray = filename.split('.');
        let type = nameArray[nameArray.length - 1];
        let date = new Date().getTime()
        let ran=parseInt(Math.random()*89999+10000);
        let avatarName = ran + date + '.' + type;
        let newPath = form.uploadDir + "/" + avatarName;
        fs.renameSync(files.file.path, newPath);  //重命名
        res.send("https://www.wuzhenlu.cn/page/upload/"+avatarName)
    })
});

// 接收用户提交的试卷
router.post("/settestpaper.php",function(req,res){
    //判断试卷名称是否存在
    testPaperModel.find({"title":req.body.title}).exec(function (err,data) {
        if (data.length){
            res.send("2");
        }
        else {
            let testPaper=new testPaperModel();
            let options=req.body.options;
            testPaper.title = req.body.title;
            testPaper.options=req.body.options;
            testPaper.classify = req.body.classify;
            testPaper.userid = req.body.userid;
            testPaper.username = req.body.username;
            testPaper.overt = req.body.overt;
            testPaper.collect = 0;
            testPaper.time = new Date().toLocaleDateString();
            testPaper.timestamp = Date.parse(new Date());
            testPaper.random = Number.parseInt(Math.random()*10);
            testPaper.save(function (err) {
                if(err){
                    res.send("0");
                }
                else{
                    subjectModel.find({"_id" : { $in: options }}).exec(function(err,datas){
                        for(let i=0;i<datas.length;i++){
                            datas[i].isaddpaper = true
                            datas[i].save((err)=>{
                                if (err){
                                    throw  err
                                }
                                else {
                                    // console.log('加入成功')
                                }
                            })
                        }
                    });
                    res.send('1');
                }
            })
        }
    })
})

//接收用户 获取 默认设置和个人信息的请求
router.get("/getinformation.php",function(req,res){
    let userid = req.query.userid;
    collectionModel.find({"userid":userid}).exec(function (err,data) {
        if (!data || data.length===0){
            res.send('0')
        }
        else {
            data[0].havefinishedpaper=[]
            data[0].havefinished=[]
            data[0].collectionlist=[]
            data[0].testPaperlist=[]
            res.send(data[0])
        }
    })
})

//接收用户默认设置
router.get("/setinformation.php",function(req,res){
    let id = req.query.id;
    collectionModel.findById(id).exec(function (err,data) {
        if (err){
            res.send(err)
        }
        else {
            if (req.query.defaultsubjectovet) {
                data.defaultsubjectovet = req.query.defaultsubjectovet
            }
            if (req.query.defaulttestpaperovet) {
                data.defaulttestpaperovet = req.query.defaulttestpaperovet
            }
            if (req.query.defaultsubjectclassify) {
                data.defaultsubjectclassify = JSON.parse(req.query.defaultsubjectclassify)
            }

            if (req.query.defaulttestpaperclassify) {
                data.defaulttestpaperclassify = JSON.parse(req.query.defaulttestpaperclassify)
            }
            data.save(function (err) {
                if(!err){
                    res.send('1')
                }
            })
        }
    })
})

//接收设置用户个人信息
router.get("/setinformationdata.php",function(req,res){
    let id = req.query.id;
    collectionModel.find({'userid':id}).exec(function (err,data) {
        if (err){
            res.send(err)
        }
        else {

            if (req.query.username) {
                data[0].username = req.query.username
            }
            if (req.query.gender) {
                data[0].gender = req.query.gender
            }
            data[0].save(function (err) {
                if(!err){
                    res.send('1')
                }
            })
        }
    })
})

// 接收收藏题目请求
router.get("/collectionsubject.php",function(req,res){
    let id = req.query.id;
    let userid = req.query.userid;
    collectionModel.find({"userid":userid}).exec(function(err,data){
        if (data[0].collectionlist.length === 0) {
            data[0].collectionlist.push(id)
            data[0].save((err)=>{
                if(err){
                    throw err
                }
                else {
                    Changecollectionnumber(id,true)
                    res.send("1");
                }
            })
        }
        else{
            let a = true
            for (let i=0;i<data[0].collectionlist.length;i++){
                if (data[0].collectionlist[i] === id) {
                    data[0].collectionlist.splice(i,1)
                    data[0].save((err)=>{
                        if(err){
                            console.log('错误',err)
                        }
                        else {
                            Changecollectionnumber(id,false)
                            res.send("2");
                        }
                    })
                    a=false
                }
            }
           if(a){
                data[0].collectionlist.push(id)
                data[0].save((err)=>{
                    if(err){
                        throw err
                    }
                    else {
                        Changecollectionnumber(id,true)
                        res.send("1");
                    }
                })
            }
        }
    });

})

// 增加题目的收藏数
function Changecollectionnumber(id,state){
    subjectModel.findById(id).exec(function(err,data){
        if (!err){
            if(state){
                data.collect+=1;
                data.save((err)=>{
                    if (err){
                        console.log(err)
                    }
                    else {
                        // console.log('加一')
                    }
                })
            }
            else {
                data.collect-=1;
                data.save((err)=>{
                    if (err){
                        console.log(err)
                    }
                    else {
                        // console.log('减一')
                    }
                })
            }
        }
        else {
            console.log(err)
            res.send('0');
        }
    });
}

// 增加试卷的收藏数
function ChangetestPaperlistnumber(id,state){
    testPaperModel.findById(id).exec(function(err,data){
        if (!err){
            if(state){
                data.collect+=1;
                data.save((err)=>{
                    if (err){
                        console.log(err)
                    }
                    else {
                        // console.log('加一')
                    }
                })
            }
            else {
                data.collect-=1;
                data.save((err)=>{
                    if (err){
                        console.log(err)
                    }
                    else {
                        // console.log('减一')
                    }
                })
            }
        }
        else {
            console.log(err)
            res.send('0');
        }
    });
}

// 接收收藏试卷请求
router.get("/collectiontestPaper.php",function(req,res){
    let id = req.query.id;
    let userid = req.query.userid;
    collectionModel.find({"userid":userid}).exec(function(err,data){
        if (data[0].testPaperlist.length === 0) {
            data[0].testPaperlist.push(id)
            data[0].save((err)=>{
                if(err){
                    throw err
                }
                else {
                    ChangetestPaperlistnumber(id,true)
                    res.send("1");
                }
            })
        }
        else{
            let a = true
            for (let i=0;i<data[0].testPaperlist.length;i++){
                if (data[0].testPaperlist[i] === id) {
                    data[0].testPaperlist.splice(i,1)
                    data[0].save((err)=>{
                        if(err){
                            console.log('错误',err)
                        }
                        else {
                            ChangetestPaperlistnumber(id,false)
                            res.send("2");
                        }
                    })
                    a=false
                }
            }
            if(a){
                data[0].testPaperlist.push(id)
                data[0].save((err)=>{
                    if(err){
                        throw err
                    }
                    else {
                        ChangetestPaperlistnumber(id,true)
                        res.send("1");
                    }
                })
            }
        }
    });
})

// 接收举报题目请求
router.get("/reportsubject.php",function(req,res){
    let id = req.query.id;
    let userid = req.query.userid;
    subjectModel.findById(id).exec(function (err,subjecdata) {
      if (!err){
          collectionModel.find({"userid":subjecdata.userid}).exec(function (err,collectiondata) {
              if (!err){
                  collectiondata[0].Numberofreports += 1
                  collectiondata[0].save(function (err) {
                      if (err){
                          throw err
                      }
                  })
              }
          })
      }
    })
    reportModel.find({"reportid":id}).exec(function(err,data){
        if(!data.length){
            let reportdata=new reportModel();
            reportdata.report = [userid]
            reportdata.reportid = id
            reportdata.save(function (err) {
                if(err){
                    res.send("0");
                }
                else{
                    res.send('1');
                }
            })
        }
        else{
            let state = true
            for (let i=0;i<data[0].report.length;i++){
                if (data[0].report[i] === userid){
                    state = false
                    res.send("2");
                }
            }
            if(state){
                data[0].report.push(userid)
                if (data[0].report.length >= 1){
                    data[0].remove()
                    subjectModel.findById(id).exec(function (err,data2) {
                        if (data2.assets !== ''){
                            let assetsarr = data2.assets.split('/')
                            let imgname = assetsarr[assetsarr.length-1]
                            fs.unlink(__dirname + '/../public/page/upload/'+imgname,function(err){
                                if(err){
                                    throw err;
                                }else{
                                    console.log('删除图片！');
                                }
                            });
                        }
                        data2.remove(function (err) {
                            if(err){
                                res.send("0");
                            }
                            else{
                                res.send('1');
                            }
                        })
                    })
                }
                else {
                    data[0].save((err)=>{
                        if (err){
                            throw err
                        }
                        else {
                            res.send('1')
                        }
                    })
                }

            }
        }
    });
})

// 接收举报试卷请求
router.get("/reportpaper.php",function(req,res){
    let paperid = req.query.paperid;
    let userid = req.query.userid;
    testPaperModel.findById(paperid).exec(function (err,subjecdata) {
        if (!err){
            collectionModel.find({"userid":subjecdata.userid}).exec(function (err,collectiondata) {
                if (!err){
                    collectiondata[0].Numberofreports += 1
                    collectiondata[0].save(function (err) {
                        if (err){
                            throw err
                        }
                    })
                }
            })
        }
    })
    reportModel.find({"reportid":paperid}).exec(function(err,data){
        if(!data.length){
            let reportdata=new reportModel();
            reportdata.report = [userid]
            reportdata.reportid = paperid
            reportdata.save(function (err) {
                if(err){
                    res.send("0");
                }
                else{
                    res.send('1');
                }
            })
        }
        else{
            let state = true
            for (let i=0;i<data[0].report.length;i++){
                if (data[0].report[i] === userid){
                    state = false
                    res.send("2");
                }
            }
            if(state){
                data[0].report.push(userid)
                if (data[0].report.length >= 10){
                    data[0].remove()
                    testPaperModel.findById(paperid).exec(function (err,data2) {
                        data2.remove(function (err) {
                            if(err){
                                res.send("0");
                            }
                            else{
                                res.send('1');
                            }
                        })
                    })
                }
                else {
                    data[0].save((err)=>{
                        if (err){
                            throw err
                        }
                        else {
                            res.send('1')
                        }
                    })
                }
            }
        }
    });
})

//接收试卷id或试题id和用户id,判断试题或试卷是否被举报或收藏,以及收藏数量
router.get("/iscollectionandreporting.php",function(req,res){
    let paperid = req.query.paperid;
    let userid = req.query.userid;
    let subjectid = req.query.subjectid;
    let obj ={
        reportstate:false,
        papercollectionstate:false,
        subjectcollectionstate:false,
        collectionnumber:0
    }
    collectionModel.find({"userid":userid}).exec(function(err,data){
        // 试卷
        if (paperid !== 'undefined' && data[0].testPaperlist.length !== 0) {
            for(let i=0;i<data[0].testPaperlist.length;i++){
                if (data[0].testPaperlist[i] === paperid) {
                    obj.papercollectionstate = true
                }
            }
            testPaperModel.findById(paperid).exec(function(err,data){
                if (!err){
                    obj.collectionnumber = data.collect
                    reportModel.find({"reportid":paperid}).exec(function(err,datas){
                        if(!err && datas.length){
                            for (let i=0;i<datas[0].report.length;i++){
                                if (datas[0].report[i] === userid){
                                    obj.reportstate = true
                                }
                            }
                            res.send(obj)
                        }
                        else {
                            res.send(obj)
                        }

                    });
                }
                else {
                    console.log(err)
                    res.send('0');
                }
            });

        }
        // 试题
        else if(subjectid !== 'undefined' && data[0].collectionlist.length !== 0){
            for(let i=0;i<data[0].collectionlist.length;i++){
                if (data[0].collectionlist[i] === subjectid) {
                    obj.subjectcollectionstate = true
                }
            }
            subjectModel.findById(subjectid).exec(function(err,data){
                if (!err){
                    obj.collectionnumber = data.collect
                    reportModel.find({"reportid":subjectid}).exec(function(err,datas){
                        if(!err && datas.length){
                            for (let i=0;i<datas[0].report.length;i++){
                                if (datas[0].report[i] === userid){
                                    obj.reportstate = true
                                }
                            }
                            res.send(obj)
                        }
                        else {
                            res.send(obj)
                        }

                    });
                }
                else {
                    console.log(err)
                    res.send('0');
                }
            });
        }

    });
})

//后台查看被举报的题目
router.get("/adminreportsubject.php",function(req,res){
    let pages = req.query.page
    let obj ={}
    let keywordarr = [{title : /./}]
    if(req.query.classify){
        obj.classify = req.query.classify
    }
    if(req.query.overt){
        obj.overt = req.query.overt
    }
    if (req.query.keyword) {
        // obj.title = { $regex: new RegExp(req.query.keyword, 'img') }
        let regex = { $regex: new RegExp(req.query.keyword, 'img') }
        keywordarr = [{ title: regex }, { username: regex }]
    }
    reportModel.find().exec(function(err,data){
        if(!err){
            let arr =[]
            for (let i=0;i<data.length;i++){
                arr.push(data[i].reportid)
            }
            obj._id={ $in:arr }
            subjectModel.find(obj).or(keywordarr).exec(function (err,datale) {
                if(!err){
                    subjectModel.find(obj).or(keywordarr).skip(pages*30).limit(30).exec(function (err,data2) {
                        if(!err){
                            for (let i=0;i<data.length;i++){
                                for (let j=0;j<data2.length;j++) {
                                    if (data[i].reportid == data2[j]._id) {
                                        data2[j].reportsNumber = data[i].report.length;
                                    }
                                }
                            }
                            data2.sort((a,b)=>{
                                return b.reportsNumber - a.reportsNumber
                            })
                            let obj2 = {
                                list :data2,
                                length: Math.ceil(datale.length/30)
                            }
                            res.send(obj2)
                        }
                    })
                }
            })

        }
    });
})

//后台查看被举报的试卷
router.get("/adminreportpaper.php",function(req,res){
    let pages = req.query.page
    let obj ={}
    let keywordarr = [{title : /./}]
    if(req.query.classify){
        obj.classify = req.query.classify
    }
    if(req.query.overt){
        obj.overt = req.query.overt
    }
    if (req.query.keyword) {
        // obj.title = { $regex: new RegExp(req.query.keyword, 'img') }
        let regex = { $regex: new RegExp(req.query.keyword, 'img') }
        keywordarr = [{ title: regex }, { username: regex }]
    }
    reportModel.find().exec(function(err,data){
        if(!err){
            let arr =[]
            data.sort((a,b)=>{
                return b.report.length - a.report.length
            })
            for (let i=0;i<data.length;i++){
                arr.push(data[i].reportid)
            }
            obj._id={ $in:arr }
            testPaperModel.find(obj).or(keywordarr).exec(function (errl,datale) {
                if(!errl){
                    testPaperModel.find(obj).or(keywordarr).skip(pages*30).limit(30).exec(function (err,data2) {
                        if(!err){
                            for (let i=0;i<data.length;i++){
                                for (let j=0;j<data2.length;j++) {
                                    if (data[i].reportid == data2[j]._id) {
                                        data2[j].reportsNumber = data[i].report.length;
                                    }
                                }
                            }
                            data2.sort((a,b)=>{
                                return b.reportsNumber - a.reportsNumber
                            })
                            let obj2 = {
                                list :data2,
                                length: Math.ceil(datale.length/30)
                            }

                            res.send(obj2)
                        }
                    })
                }
            })

        }
    });
})

// 后台获取试卷及试卷下的题目
router.get("/admingetTestQuestions.php",function(req,res){
    let paperid = req.query.paperid;
    testPaperModel.findById(paperid).exec(function(err2,data1){
        if (!err2){
            if (!data1){
                res.send('3');
            }
            else {
                subjectModel.find({"_id" : { $in: data1.options }}).exec(function(err3,datas){
                    if (!err3){
                        for(let i=0;i<datas.length;i++){
                            for (let j=0;j<data1.options.length;j++){
                                if (datas[i]._id.toString()===data1.options[j]){
                                    datas[i].sort = j
                                }
                            }
                        }
                        datas.sort((a,b)=>{
                            return a.sort - b.sort
                        })
                        res.send(datas);
                    }
                    else {
                        console.log(err3)
                        res.send('0');
                    }
                });
            }
        }
        else {
            console.log(err2)
            res.send('0');
        }
    });


})

//后台删除题目
router.get("/admindeleteTopic.php",function(req,res){
    let id = req.query.id;
    subjectModel.findById(id).exec(function(err,data){
        if (data.assets !== ''){
            let assetsarr = data.assets.split('/')
            let imgname = assetsarr[assetsarr.length-1]
            fs.unlink(__dirname + '/../public/page/upload/'+imgname,function(err){
                if(err){
                    throw err;
                }else{
                    console.log('删除图片！');
                }
            });
        }
        data.remove((err)=>{
            if (!err){
                res.send('1')
            }
            else {
                res.send('0')
            }
        });
    });
})

//后台删除试卷
router.get("/admindeletepaper.php",function(req,res){
    let id = req.query.id;
    testPaperModel.findById(id).exec(function(err,data){
        data.remove((err)=>{
            if (!err){
                res.send('1')
            }
            else {
                res.send('0')
            }
        });
    });
})

//后台获取用户信息
router.get("/getuserdata.php",function(req,res){
    let pages = req.query.page;
    let obj ={}
    let sortobj = req.query.timestamp || 'Numberofreports'
    if (req.query.keyword) {
        obj.username = { $regex: new RegExp(req.query.keyword, 'img') }
    }
    if (req.query.overt === 'true') {
        obj.Numberofreports = { $gte : 100}
    }
    else {
        obj.Numberofreports = { $lt : 100}
    }
    collectionModel.find(obj).exec(function (err,datas) {
        if (!datas){
            res.send('0')
        }
        else {
            collectionModel.find(obj).sort({ [sortobj] : -1}).skip(pages*30).limit(30).exec(function (err,data) {
                if (!data){
                    res.send('0')
                }
                else {
                   let arr = []
                    data.map(function (itme) {
                        arr.push({
                            username:itme.username,
                            userid:itme.userid,
                            gender:itme.gender,
                            collectionlist:itme.collectionlist.length,
                            testPaperlist:itme.testPaperlist.length,
                            havefinished:itme.havefinished.length,
                            havefinishedpaper:itme.havefinishedpaper.length,
                            Numberofreports:itme.Numberofreports,
                            time:itme.time,
                            _id:itme._id
                        })
                        // return itme
                    })
                    let obj2 = {
                        length: Math.ceil(datas.length/30),
                        list:arr,
                    }
                    res.send(obj2)
                }
            })
        }
    })
})

//后台拉黑用户
router.get("/Blackusers.php",function(req,res){
    let id = req.query.id;
    collectionModel.findById(id).exec(function (err,data) {
        if (err){
            res.send(err)
        }
        else {
            data.Numberofreports = 100
            data.save(function (err) {
                if(!err){
                    res.send('1')
                }
            })
        }
    })
})

//后台取消拉黑用户
router.get("/unBlackusers.php",function(req,res){
    let id = req.query.id;
    collectionModel.findById(id).exec(function (err,data) {
        if (err){
            res.send(err)
        }
        else {
            data.Numberofreports = 0
            data.save(function (err) {
                if(!err){
                    res.send('1')
                }
            })
        }
    })
})

// 根据搜索条件获取我的题目
router.get("/getmyTopic.php",function(req,res){
    let userid = req.query.userid;
    let pages = req.query.page
    let obj ={
        "userid":userid
    }
    let keywordarr = [{title : /./}]
    if(req.query.classify){
        obj.classify = req.query.classify
    }
    if(req.query.overt){
        obj.overt = req.query.overt
    }
    if (req.query.keyword) {
        // obj.title = { $regex: new RegExp(req.query.keyword, 'img') }
        let regex = { $regex: new RegExp(req.query.keyword, 'img') }
        keywordarr = [{ title: regex }, { username: regex }]
    }
    subjectModel.find(obj).or(keywordarr).sort({ "timestamp" : -1}).skip(pages*30).limit(30).exec(function(err,data){
        if (!err){
            res.send(data);
        }
        else {
            console.log(err)
            res.send('0');
        }
    });
})

//根据题目id获取题目详情
router.get("/admingetTopicdeli.php",function(req,res){
    let id = req.query.id;
    subjectModel.findById(id).exec(function(err,data){
        if (!err){
            res.send(data)
        }
    });
})

// 获取我的试卷
router.get("/getmypaper.php",function(req,res){
    let userid = req.query.userid;
    let page = req.query.page;
    let obj ={
        "userid":userid
    }
    let keywordarr = [{title : /./}]
    if(req.query.classify){
        obj.classify = req.query.classify
    }
    if(req.query.overt){
        obj.overt = req.query.overt
    }
    if (req.query.keyword) {
        // obj.title = { $regex: new RegExp(req.query.keyword, 'img') }
        let regex = { $regex: new RegExp(req.query.keyword, 'img') }
        keywordarr = [{ title: regex }, { username: regex }]
    }
    testPaperModel.find(obj).or(keywordarr).sort({"timestamp":-1}).skip(page*30).limit(30).exec(function(err,data){
        if (!err){
            res.send(data);
        }
        else {
            console.log(err)
            res.send('0');
        }
    });
})

// 获取试卷下的题目
router.get("/getpaperInTopic.php",function(req,res){
    let options = req.query.options;
    subjectModel.find({"_id" : { $in: JSON.parse(options) }}).exec(function(err,datas){
        for(let i=0;i<datas.length;i++){
            for (let j=0;j<JSON.parse(options).length;j++){
                if (datas[i]._id.toString()===JSON.parse(options)[j]){
                    datas[i].sort = j
                }
            }
        }
        datas.sort((a,b)=>{
            return a.sort - b.sort
        })
        if (!err){
            res.send(datas);
        }
        else {
            console.log(err)
            res.send('0');
        }
    });

})

// 根据搜索条件获取我收藏的题目
router.get("/getmycollectionTopic.php",function(req,res){
    let userid = req.query.userid;

    collectionModel.find({"userid":userid}).exec(function(err,data){
        if(!err){
            let paper = data[0].collectionlist
            let page = req.query.page;
            let obj ={
                "_id":{ $in: paper }
            }
            let keywordarr = [{title : /./}]
            if(req.query.classify){
                obj.classify = req.query.classify
            }
            if(req.query.overt){
                obj.overt = req.query.overt
            }
            if (req.query.keyword) {
                // obj.title = { $regex: new RegExp(req.query.keyword, 'img') }
                let regex = { $regex: new RegExp(req.query.keyword, 'img') }
                keywordarr = [{ title: regex }, { username: regex }]
            }
            subjectModel.find(obj).or(keywordarr).exec(function(errs,datas){
                if (datas.length) {
                    for(let i=0;i<datas.length;i++){
                        for (let j=0;j<paper.length;j++){
                            if (datas[i]._id.toString()===paper[j]){
                                datas[i].sort = j
                            }
                        }
                    }
                }
                datas.sort((a,b)=>{
                    return b.sort - a.sort
                })
                datas = datas.splice(page*30,30)
                if (!err){
                    res.send(datas);
                }
                else {
                    console.log(err)
                    res.send('0');
                }
            });
        }
    });

})

// 获取我收藏的试卷
router.get("/getmycollectionPaper.php",function(req,res){
    let userid = req.query.userid;
    let page = req.query.page;
    collectionModel.find({"userid":userid}).exec(function(err,data){
        if(!err){
            let paper = data[0].testPaperlist
            let obj ={
                "_id":{ $in: paper }
            }
            let keywordarr = [{title : /./}]
            if(req.query.classify){
                obj.classify = req.query.classify
            }
            if(req.query.overt){
                obj.overt = req.query.overt
            }
            if (req.query.keyword) {
                // obj.title = { $regex: new RegExp(req.query.keyword, 'img') }
                let regex = { $regex: new RegExp(req.query.keyword, 'img') }
                keywordarr = [{ title: regex }, { username: regex }]
            }
            testPaperModel.find(obj).or(keywordarr).exec(function(errs,datas){
                if (!errs && datas){
                    for(let i=0;i<datas.length;i++){
                        for (let j=0;j<paper.length;j++){
                            if (datas[i]._id.toString()===paper[j]){
                                datas[i].sort = j
                            }
                        }
                    }
                    datas.sort((a,b)=>{
                        return b.sort - a.sort
                    })
                    datas = datas.splice(page*30,30)
                    if (!err){
                        res.send(datas);
                    }
                    else {
                        res.send('0');
                    }
                }
                else {
                    console.log(errs)
                    res.send('0');
                }

            });
        }
        else {
            console.log(err)
            res.send([])
        }
    });

})

// 删除一个题目
router.get("/deleteTopic.php",function(req,res){
    let id = req.query.id;
    subjectModel.findById(id).exec(function(err,data){
        if (data.assets !== '' && data.collect === 0 && !data.isaddpaper){
            let assetsarr = data.assets.split('/')
            let imgname = assetsarr[assetsarr.length-1]
            fs.unlink(__dirname + '/../public/page/upload/'+imgname,function(err){
                if(err){
                    throw err;
                }else{
                    console.log('删除图片！');
                }
            });
        }
        if (data.collect !== 0 || data.isaddpaper) {
            data.userid = ''
            data.save((err)=>{
                if (!err){
                    res.send('1')
                }
                else {
                    res.send('0')
                }
            })
        }
        else {
            data.remove((err)=>{
                if (!err){
                    res.send('1')
                }
                else {
                    res.send('0')
                }
            });
        }
    });
})

// 删除一张试卷
router.get("/deletepaper.php",function(req,res){
    let id = req.query.id;
    testPaperModel.findById(id).exec(function(err,data){
        if (data.collect !== 0) {
            data.userid = ''
            data.save((err)=>{
                if (!err){
                    res.send('1')
                }
                else {
                    res.send('0')
                }
            })
        }
        else {
            data.remove((err)=>{
                if (!err){
                    res.send('1')
                }
                else {
                    res.send('0')
                }
            });
        }
    });
})

// 获取某个分类下的题目
router.get("/getsubject.php",function(req,res){
    let classify = req.query.classify;
    let userid = req.query.userid;
    collectionModel.find({"userid":userid}).exec(function(err,data){
        let havefinished = []
        if(data[0]){
           havefinished = data[0].havefinished
        }
        if(!err){
            let subjectdata = []
            let randoms = Number.parseInt(Math.random()*10)
            let count = 0
            f(randoms)
            function f(random) {
                subjectModel.find({
                    "classify":classify,
                    "overt":true,
                    "random":random,
                    "_id" : { $nin: havefinished }}).limit(10).exec(function(err,data){
                    if (!err){
                        subjectdata = subjectdata.concat(data)
                        count += 1
                        if (count<10 && subjectdata.length<10){
                            if (random===9){
                                random = -1
                            }
                            f(random+1)
                        }
                        else {
                            if (subjectdata.length>10){
                                subjectdata.length = 10;
                            }
                            res.send(shuffle(subjectdata));
                        }
                    }
                    else {
                        console.log(err)
                        res.send('0');
                    }
                });
            }
            function shuffle(array) {
                let currentIndex = array.length, temporaryValue, randomIndex;
                while (currentIndex !== 0) {
                    randomIndex = Math.floor(Math.random() * currentIndex);
                    currentIndex -= 1;
                    temporaryValue = array[currentIndex];
                    array[currentIndex] = array[randomIndex];
                    array[randomIndex] = temporaryValue;
                }
                return array;
            }
        }
    });
})

// 获取某个分类下的试卷
router.get("/gettestpaper.php",function(req,res){
    let classify = req.query.classify;
    testPaperModel.find({"classify":classify}).exec(function(err,data){
        if (!err){
            res.send(data);
        }
        else {
            console.log(err)
            res.send('0');
        }
    });
})

// 获取某个试卷
router.get("/getonepaper.php",function(req,res){
    let paperid = req.query.paperid;
    testPaperModel.findById(paperid).exec(function(err,data){
        if (!err && data){
            res.send(data);
        }
        else {
            console.log(err)
            res.send('0');
        }
    });
})

// 接收用户已经做完的题目
router.get("/sethavefinishedlist.php",function(req,res){
    let havefinishedlist = req.query.havefinishedlist;
    let userid = req.query.userid;

    collectionModel.find({"userid":userid}).exec(function(err,data){
        data[0].havefinished = data[0].havefinished.concat(JSON.parse(havefinishedlist))
        data[0].save((err)=>{
            if(!err){
                res.send('1')
            }
            else {
                res.send('0')
            }
        })
    });
})

// 接收用户已经做完的试卷
router.get("/sethavefinishedpaper.php",function(req,res){
    let paperid = req.query.paperid;
    let userid = req.query.userid;

    collectionModel.find({"userid":userid}).exec(function(err,data){
        data[0].havefinishedpaper.push(paperid)
        data[0].save((err)=>{
            if(!err){
                res.send('1')
            }
            else {
                res.send('0')
            }
        })
    });
})

// 获取符合搜索结果的试卷
router.get("/getsearchpaper.php",function(req,res){
    let pages = req.query.page
    let userid = req.query.userid
    let iscomplete = req.query.iscomplete
    let obj ={}
    let keywordarr = [{ title: /./ }]
    if(req.query.overt){
        obj.overt = req.query.overt
    }
    if(req.query.classify){
        obj.classify = req.query.classify
    }
    if (req.query.keyword) {
        // obj.title = { $regex: new RegExp(req.query.keyword, 'img') }
        let regex = { $regex: new RegExp(req.query.keyword, 'img') }
        keywordarr = [{ title: regex }, { username: regex }]
    }
    if (iscomplete !== undefined){
        // 前端
        collectionModel.find({"userid":userid}).exec(function (errs,infodatas) {
            if (!errs && infodatas.length){
                if (iscomplete === 'false') {
                    obj._id = { $nin: infodatas[0].havefinishedpaper }
                }
                else if (iscomplete === 'true'){
                    obj._id = { $in: infodatas[0].havefinishedpaper }
                }
                testPaperModel.find(obj).or(keywordarr).sort({ "collect" : -1}).skip(pages*30).limit(30).exec(function(err,data){
                    if (!err){
                        if (iscomplete === 'true'){
                            data.map(function (itme) {
                                itme.ishavefinishedpaper = true
                            })
                        }
                        res.send(data);
                    }
                    else {
                        console.log(err)
                        res.send('0');
                    }
                });
            }
            else {
                console.log(errs)
                res.send('0');
            }
        })
    }
    else {
        //后台
        testPaperModel.find(obj).or(keywordarr).exec(function(err1,data1){
            if (!err1){
                testPaperModel.find(obj).or(keywordarr).sort({ "timestamp" : -1}).skip(pages*30).limit(30).exec(function(err,data){
                    if (!err){
                        let obj2 = {
                            list :data,
                            length: Math.ceil(data1.length/30)
                        }
                        res.send(obj2);
                    }
                    else {
                        console.log(err)
                        res.send('0');
                    }
                });
            }
            else {
                console.log(err1)
                res.send('0');
            }
        });
    }

})

// 后台获取符合搜索结果的试题
router.get("/getsearchtopic.php",function(req,res){
    let pages = req.query.page
    let obj ={}
    let keywordarr = [{ title: /./ }]
    if(req.query.classify){
        obj.classify = req.query.classify
    }
    if(req.query.userid){
        obj.userid = req.query.userid
    }
    if(req.query.overt){
        obj.overt = req.query.overt
    }
    if (req.query.keyword) {
        // obj.title = { $regex: new RegExp(req.query.keyword, 'img') }
        let regex = { $regex: new RegExp(req.query.keyword, 'img') }
        keywordarr = [{ title: regex }, { username: regex }]
    }
    subjectModel.find(obj).or(keywordarr).exec(function(err1,data1){
        if (!err1){
            subjectModel.find(obj).or(keywordarr).sort({ "timestamp" : -1}).skip(pages*30).limit(30).exec(function(err,data){
                if (!err){
                    let obj2 = {
                        list :data,
                        length: Math.ceil(data1.length/30)
                    }
                    res.send(obj2);
                }
                else {
                    console.log(err)
                    res.send('0');
                }
            });
        }
        else {
            console.log(err1)
            res.send('0');
        }
    });

})

// 获取试卷及试卷下的题目
router.get("/getTestQuestions.php",function(req,res){
    let paperid = req.query.paperid;
    let userid = req.query.userid;
    let state = true;
    collectionModel.find({"userid":userid}).exec(function(err1,data){
        let havefinishedpaper = data[0].havefinishedpaper
        if (err1){
            console.log(err1)
        }
        for (let i=0;i<havefinishedpaper.length;i++){
            if(state && havefinishedpaper[i] === paperid){
                testPaperModel.findById(paperid).exec(function(err2,data1){
                    if (!err2){
                        if (!data1){
                            res.send('3');
                        }
                        else {
                            res.send('2')
                        }
                    }
                });
                state = false
            }
        }
        if(state){
            testPaperModel.findById(paperid).exec(function(err2,data1){
                if (!err2){
                    if (!data1){
                        res.send('3');
                    }
                    else {
                        subjectModel.find({"_id" : { $in: data1.options }}).exec(function(err3,datas){
                            if (!err3){
                                for(let i=0;i<datas.length;i++){
                                    for (let j=0;j<data1.options.length;j++){
                                        if (datas[i]._id.toString()===data1.options[j]){
                                            datas[i].sort = j
                                        }
                                    }
                                }
                                datas.sort((a,b)=>{
                                    return a.sort - b.sort
                                })
                                res.send(datas);
                            }
                            else {
                                console.log(err3)
                                res.send('0');
                            }
                        });
                    }
                }
                else {
                    console.log(err2)
                    res.send('0');
                }
            });
        }
    });


})

// 获取分享页面的试卷及试卷下的题目
router.get("/getshareTestQuestions.php",function(req,res){
    let paperid = req.query.paperid;
    testPaperModel.findById(paperid).exec(function(err,data1){
        if (!err && data1){
            subjectModel.find({"_id" : { $in: data1.options }}).exec(function(err,datas){
                for(let i=0;i<datas.length;i++){
                    for (let j=0;j<data1.options.length;j++){
                        if (datas[i]._id.toString()===data1.options[j]){
                            datas[i].sort = j
                        }
                    }
                }
                datas.sort((a,b)=>{
                    return a.sort - b.sort
                })
                if (!err){
                    res.send(datas);
                }
                else {
                    console.log(err)
                    res.send('0');
                }
            });
        }
        else {
            console.log(err)
            res.send('0');
        }
    });

})

// 获取试卷和试题的所有分类
router.get("/getallclassfiy.php",function(req,res){
    allclassifyModel.find().exec(function(err,data1){
        if (!err){
            res.send(data1);
        }
        else {
            console.log(err)
            res.send('0');
        }
    });
})

// 设置试卷和试题的所有分类
router.post("/setallclassfiy.php",function(req,res){
    let id = req.body.id;
    allclassifyModel.findById(id).exec(function(err,data1){
        if (!err){
            data1.maxclass = req.body.maxclass
            data1.minclass = JSON.parse(req.body.minclass)
            data1.save((err)=>{
                if(!err){
                    res.send('1')
                }
                else {
                    res.send('0')
                }
            })
        }
        else {
            console.log(err)
            res.send('0');
        }
    });
})

// 添加一个大分类
router.get("/addallclassfiy.php",function(req,res){
    allclassifyModel.find().exec(function(err,data1){
        if (!err){
            let allclassify=new allclassifyModel();
            allclassify.maxclass = req.query.maxclass
            allclassify.minclass = req.query.minclass
            allclassify.save((err)=>{
                if(!err){
                    res.send('1')
                }
                else {
                    res.send('0')
                }
            })
        }
        else {
            console.log(err)
            res.send('0');
        }
    });
})

// 删除一个大分类
router.get("/delmaxclass.php",function(req,res){
    let id = req.query.id;
    allclassifyModel.findById(id).exec(function(err,data1){
        if (!err){
            data1.remove((err)=>{
                if (!err){
                    res.send('1')
                }
                else {
                    res.send('0')
                }
            });
        }
        else {
            console.log(err)
            res.send('0');
        }
    });
})

module.exports = router;
