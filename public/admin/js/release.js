$(function(){

	let vue = new Vue({
		'el':'.news_form',
		data:{
			arr:[],
			i:0,
            Enclosure:[],
		},
		mounted(){
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

			// 列表交互
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

            // 关联富文本的附件
            UE.Enclosure = []
            this.Enclosure = UE.Enclosure

			// 提交表单数据
            $("#btn").on('click', ()=> {

                // 将数组转成字符串
                var title=$("#title").val(); //获取标题
                var classify=$("#classify").val(); //获取类型
                var anchor=JSON.stringify(this.arr); //获取锚点
                var Enclosure=JSON.stringify(this.Enclosure);	//附件
                var content=getContent();			//获取内容
                $.post('release.php',{
                    "title":title,
                    "classify":classify,
                    "anchor":anchor,
                    'content':content,
                    'enclosure':Enclosure
                },function (data) {
                    if(data==1){
                        alert('发布成功')
                        location.href='list.html';
                    }
                    else{
                        alert('发布失败')
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
//      alert(arr.join("\n"));
            }
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
		}
	})
});
