$(function(){

	let vue = new Vue({
		'el':'.mainbox',
		data:{
			arr:[],
			i:0,
            Enclosure:[],
		},
		mounted(){
			let _this = this
            // 列表交互
            $('#anchorbnt2').on('click', ()=>{
                var value = prompt('标题', '');
                // console.log(UE.getEditor('editor').execCommand('insertHtml','aaa'))
                let title = '<h2 id="title'+this.i+'">'+value+'</h2>'
                UE.getEditor('editor').execCommand('insertHtml', title)
                this.arr.push({
                    anchor:'title'+this.i,
                    anchortitle:value
                })
                this.i++
            })

            $('dt').click(function(){
                var obj=$(this).next();
                if($(this).next().css('display')=='block'){
                    obj.hide('fast');
                    $(this).removeClass('on');
                }else{
                    obj.show('fast');
                    $(this).addClass('on');
                }
            });


            // 提交表单数据
            $("#btn").on('click',function () {


                // 将数组转成字符串
                var id=_id;					 //获取id
                var title=$("#title").val(); //获取标题
                var classify=$("#classify").val(); //获取类型
                var anchor=JSON.stringify(_this.arr);	//获取锚点
                var Enclosure=JSON.stringify(_this.Enclosure);	//附件
                var content=getContent();			//获取内容

                $.post('edit.php',{
                    "id":id,
                    "title":title,
                    "classify":classify,
                    "anchor":anchor,
                    'content':content,
                    'enclosure':Enclosure
                },function (data) {
                    if(data==1){
                        alert('修改成功')
                        location.href='list.html';
                    }
                    else{
                        alert('修改失败')
                    }

                })


            })


            //内容
            //实例化编辑器
            //建议使用工厂方法getEditor创建和引用编辑器实例，如果在某个闭包下引用该编辑器，直接调用UE.getEditor('editor')就能拿到相关的实例

            var ue = UE.getEditor('editor');

            function getContent() {
                var arr = [];
//      arr.push("使用editor.getContent()方法可以获得编辑器的内容");
//      arr.push("内容为：");
                arr.push(UE.getEditor('editor').getContent());
                return arr;
            }

            function insertHtml() {
                var value = prompt('插入html代码', '');
                console.log(UE.getEditor('editor').execCommand('insertHtml','aaa'))
                UE.getEditor('editor').execCommand('insertHtml', value)
            }

            function setContent(isAppendTo) {
                var arr = [];
                arr.push("使用editor.setContent('欢迎使用ueditor')方法可以设置编辑器的内容");
                UE.getEditor('editor').setContent('欢迎使用ueditor');
                alert(arr.join("\n"));
            }
            // 获取id
            var _id=location.href.split('=')[1];

            // 发送Ajax请求获取数据进行数据回显
            $.get('/admin/modify.php?id='+_id,function(ditedata){
                $("#title").val(ditedata.title); 		//回显标题
                $("#classify").val(ditedata.classify); //回显类型

                // 回显内容
                setTimeout(function(){
                    UE.getEditor('editor').setContent(ditedata.content);
                },1000)

                //回显锚点
                _this.arr = JSON.parse(ditedata.anchor[0])
                _this.i = JSON.parse(ditedata.anchor[0]).length

                //回显附件
                UE.Enclosure = JSON.parse(ditedata.enclosure[0])
                _this.Enclosure = UE.Enclosure
            });
		},
        methods:{
            ondel(e){
                this.arr.map((itme,i)=>{
                    if (itme.anchor === e.target.getAttribute('data-id')){
                        this.arr.splice(i,1)
                    }
                })
            },
            ondelEnclosure(e){
                let index = e.target.getAttribute('data-index')
                let url = e.target.getAttribute('data-url')
                $.get('/admin/removeenclosure.php?fileurl='+url,(data)=>{
                    this.Enclosure.splice(index,1)
                });
            }

        },
	})


});