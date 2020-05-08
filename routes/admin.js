let express = require('express');
let router = express.Router();
let mongoose=require('mongoose');
let fs = require('fs');

mongoose.connect('mongodb://127.0.0.1:27017/blog',function (err) {
    if (err){
        throw err;
    }
    else{
        console.log('database in running...');
    }
})

// 定义文章骨架
let mongoSchema=new mongoose.Schema({
    title:String,
    classify:String,
    ctime:String,
    timestamp:Number,
    content:String,
    browse:Number,
    anchor:Array,
    enclosure:Array,
})

// 定义用户账号骨架
let usermongoSchema=new mongoose.Schema({
    user:String,
    password:String
})

    // 发布模型
   let arcitlemodel=mongoose.model('release',mongoSchema,'release');

    // 发布用户名和密码模型
    let usermodel=mongoose.model('usermode',usermongoSchema,'usermode');


//接收登录请求和用户名密码
router.post("/checkuser.php",function(req,res){
    let user=req.body.username;
    let password=req.body.password;
    usermodel.find({"user":user,"password":password}).exec(function(err,data){
        if(data.length){
            // 设置用户名的cookie
            res.cookie("user",user);
            res.send("1");
        }
        else{
            let a=new usermodel();
            a.user=user;
            a.password=password;
            a.save(function(err){
                 res.send("0");
            });
        }
    });

})

//接收判断用户是否登录请求
router.get("/checklogin.php",function(req,res){
    let cookies=req.cookies.user;
    if(cookies){
        res.send('1');
        // res.send("alert('请登录后进行操作');location.href='/admin/pages/login.html';")
    }
    else{
        res.send("alert('请登录后进行操作');location.href='/admin/index.html';")
    }


});


//接收退出请求，清除cookie把登录状态变更为未使用
router.get('/loginout.php',function(req,res){
    let user=req.cookies.user;
    res.clearCookie('user');
    //	根据cookie查询账号数据
    res.send("<script>location.href='/admin/index.html'</script>")
});

// 接收发布文章请求
   router.post('/release.php',function (req,res) {
       // 创建实体
       let arcitle=new arcitlemodel();
       arcitle.title=req.body.title;        //保存标题
       arcitle.classify=req.body.classify;  //类型
       arcitle.anchor=req.body.anchor;      //锚点
       arcitle.enclosure=req.body.enclosure;      //附件
       arcitle.ctime=new Date().toLocaleDateString(); //时间
       arcitle.timestamp=new Date().getTime(); //时间戳
       arcitle.content=req.body['content[]'];         //文章内容
       arcitle.browse=0;                    //浏览次数
       arcitle.save(function (err) {
           if(err){
               res.send("0");
           }
           else{
               res.send('1');

           }
       })
   })

// 接收文章修改请求
    router.post('/edit.php',function (req,res) {
        // 获取id
        let id=req.body.id;
        // 根据id查询数据
        arcitlemodel.findById(id).exec(function(err,data){
            if(!err){
                data.title=req.body.title;        //保存标题
                data.classify=req.body.classify;  //类型
                data.anchor=req.body.anchor;      //锚点
                data.enclosure=req.body.enclosure;   //附件
                // data.ctime=new Date().toLocaleDateString(); //时间
                data.content=req.body['content[]'];         //文章内容
                data.save(function (err) {
                    if(err){
                        res.send('0');

                    }
                    else{
                        res.send('1');

                    }
                })
            }
        })
    });

//接收文章列表请求
    router.get('/newlist.php',function(req,res){

        // 接收传过来的页数,设置默认值
        let page;
        let searcharr=[];
    	parseInt(req.query.page)? page=parseInt(req.query.page):page=1;

    	// 接收传过来的搜索条件和设置默认值
        // let searchterm;
        // req.query.search ? searchterm= req.query.search : searchterm='';

    	// 定义存放查询条件对象
    	let obj={};

    	if(req.query.style){
            obj.classify=req.query.style;
    	}

    	// 计算该页数需要跳过的数据
    	let pages=(page-1)*10;

    	let length;
    	arcitlemodel.find(obj).exec(function(err,d){
    	    // 分页页数
    		length=Math.ceil(d.length/10);


    		if(req.query.search!=='undefined' && req.query.search!==''){
                // 创建正则对象
                let re=new RegExp(req.query.search);
                // 创建存放符合搜索条件的数组

                for (let i=0;i<d.length;i++){

                    if(re.test(d[i].title) || re.test(d[i].content) ||re.test(d[i].ctime)) {
                        searcharr.push(d[i]);
                    }
                }
            }

    		arcitlemodel.find(obj).sort({"timestamp":-1}).skip(pages).limit(10).exec(function (err,data) {
                if (err){
                    throw err;
                }
                else{
                    // 判读搜索框是否有值
                    if(req.query.search==='undefined'){
                        data.push(length);
                        res.send(data);
                    }
                    else{
                        // 查询后的分页页数
                        let sun=Math.ceil(searcharr.length/10);

                        searcharr.push(sun);
                        res.send(searcharr);
                    }


                }
        	})
    	})


    });

// 接收查询所有分类数量的请求
    router.get('/stylesum.php',function(req,res){

        // 查出所有数据
        arcitlemodel.find().exec(function(err,data){

            // 定义对象存放文章类型数目
            let style={
                all:0,
                css:0,
                javascript:0,
                html:0,
                Node:0,
                Mongodb:0,
                tool:0,    //开发工具
                ambient:0, //开发环境
                other:0    //其他
            };

            // 循环数组进行判断
            for(let i=0;i<data.length;i++){

                // 对符合条件的相应对象加一
                if(data[i].classify==='css'){
                    style.css=style.css+1;
                }
                else if(data[i].classify==='javascript'){
                    style.javascript=style.javascript+1;
                }
                else if(data[i].classify==='html'){
                    style.html+=1;
                }
                else if(data[i].classify==='Node'){
                    style.Node+=1;
                }
                else if(data[i].classify==='Mongodb'){
                    style.Mongodb+=1;
                }
                else if(data[i].classify==='开发工具'){
                    style.tool+=1;
                }
                else if(data[i].classify==='开发环境'){
                    style.ambient+=1;
                }
                else{
                    style.other+=1;
                }
            }

            // 全部类型
            style.all=data.length;

            res.send(style);

        });


    });

//接收删除数据请求
	router.get('/remove.php',function(req,res){
		let id=req.query.id;
		arcitlemodel.findById(id).exec(function(err,data){
            if (data.enclosure.length !== 0){
                let fileurl = JSON.parse(data.enclosure[0])
                for (let i=0;i<fileurl.length;i++){
                    fs.unlink(__dirname + '\\..\\public\\'+fileurl[i],function(err){
                        if(err){
                            console.log(err);
                        }
                    });
                }
            }
            data.remove(function (err) {
                if(err){
                    res.send("0");
                }
                else{
                    res.send('1');
                }
            });
		})
	})

//接收删除文章配件请求
router.get('/removeenclosure.php',function(req,res){
    let fileurl=req.query.fileurl;
    fs.unlink(__dirname + '\\..\\public\\'+fileurl,function(err){
        if(err){
            console.log(err);
            res.send('0')
        }else{
            res.send('1')
        }
    });
})

//接收查看文章详情请求
	router.get('/modify.php',function(req,res){
        let id=req.query.id;
		arcitlemodel.findById(id).exec(function(err,data){

			if(data!=undefined){
				data.save(function(err){
                   if(err){
                       throw err;
                   }
                });
                if(!err){
                    res.send(data);
                }
			}

		})
	});

    // 接收文章点击事件，点击时增长浏览次数
    router.get('/browse.php',function(req,res){
        // 接收ID
        let id=req.query.id;
        // 按id查询数据
        arcitlemodel.findById(id).exec(function(err,data){
			data.browse+=1;
            data.save(function(err){
                if(err){
                    throw err;
                }
            });
            if(!err){
                res.send(data);
            }
        })
    });



/* GET home page. */
router.get('/a.php', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

module.exports = router;
