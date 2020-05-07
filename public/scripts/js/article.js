$(function(){

    // 获取id
    var _id=location.href.split('=')[1];

    // 定义一个全局的空数组用于存放锚点相关数据
    var arr=[];
    if(_id){
        // 发送请求和参数ID获取文章数据
        $.get('admin/modify.php?id='+_id,function(data){

            $('head title').html(data.title);

            $('.title').html(data.title);
            $('.times').html(data.ctime);
            $('.classify').html(data.classify);
            $('#author span').html(data.author);
            $('.content').html(data.content);
            $('.histsum').html(data.browse);


            // 接收锚点数组
            arr=JSON.parse(data.anchor[0]);
            // 循环添加文章锚点的html代码
            var html='';
            for(let i=0;i<arr.length;i++){
                html+='<a href="#'+arr[i].anchor+'"> <li data-id="'+arr[i].anchor+'" class="list-group-item '+arr[i].anchor+'">'+arr[i].anchortitle+'</li></a>';
            }
            // 输出到页面相应位置
            $('.anchorul').append(html);

            // 接收附件数组
            var enclosure=JSON.parse(data.enclosure[0]);
            // 循环添加文章锚点的html代码
            var htmlenclosure='';
            for(let i=0;i<enclosure.length;i++){
                htmlenclosure+='<a href="'+enclosure[i]+'"> <li data-id="'+enclosure[i]+'" class="list-group-item">附件'+(i+1)+'</li></a>';
            }
            // 输出到页面相应位置
            $('.enclosure').append(htmlenclosure);

        });
    }

    // 移动端交互
    $('#showbut').on('click',function(){
        if($('.anchorboxmax').css('right')==='0px'){
            $('.anchorboxmax').css('right','-50%');
        }
        else {
            $('.anchorboxmax').css('right','0');
            $('#showbut').css('right','-10%');
        }

    });

    // 点击页面其他位置时收回列表
    $('.cr,.footer').on('click',function(){
        if($('.anchorboxmax').css('right')==='0px'){
            $('.anchorboxmax').css('right','-50%');
            $('#showbut').css('right','0');
        }

    });

    //移动端的touch触摸交互
    // var st=0;
    // var end=0;
    // var le=300;
    // $('.cr,.footer').on('touchstart',function(e){
    //     console.log('开始',e.originalEvent.changedTouches[0].clientX);
    //     st=e.originalEvent.targetTouches[0].clientX;
    // })
    //
    // $('.cr,.footer').on('touchend',function(e){
		// 	console.log('结束',e.originalEvent.changedTouches[0].clientX);
		// 	console.log(end - st)
    //     console.log('开始减结束',st - end)
    //
    //     end=e.originalEvent.changedTouches[0].clientX;
    //     if(end - st > le){
    //         $('.anchorboxma').css('right','-50%');
    //     }
    //     else if( st - end < le){
    //         $('.anchorboxma').css('right','0%');
    //     }
    // })

    // 定义一个全局的滚动状态
    var state=1;
    // 添加滚动条监听事件，滚动更换当前文章要点
    $(window).scroll(function(){

        // 对滚动状态进行判断，非鼠标滚轮（点击）导致的滚动不执行滚动相关代码
     if(state===1){

         if(arr.length!==1){
             // 循环锚点数组
             for(let i=0;i<arr.length;i++){
                 // 循环获取所有锚点的offsetTop值，（元素距离顶部的值）
                 var top=$('#'+arr[i].anchor)[0].offsetTop;

                 // 对最后一个锚点进行处理
                 if(i<arr.length-1){

                     // 获取当前锚点的下一个锚点offsetTop值
                     var top2=$('#'+arr[i+1].anchor)[0].offsetTop;
                 }

                 // 对获取的当前锚点到顶部的距离和下一个锚点到顶部的距离做判断，计算出当前锚点的选中范围
                 if($(window).scrollTop()>=top-300 && $(window).scrollTop()<=top2){

                     // 移除其他锚点的选中状态
                     $('.anchorul .list-group-item').removeClass('active');
                     // 给动态获取的当前锚点添加选中类
                     $('.'+arr[i].anchor).addClass('active');
                 }
             }
         }
     }

    });

    // 锚点列表交互#337ab7
    $('.anchorul').on('click','.list-group-item',function(e){

        // 点击后将滚动状态改为0，防止触发监听的滚动条事件
        state=0;
        $('.anchorul .list-group-item').removeClass('active');
        $(this).addClass('active');

        // 阻止锚点默认跳转事件
        e.preventDefault();

        // 获取需要跳转目标距离顶部的距离
        var top=$('#'+$(this).data('id'))[0].offsetTop;


        // 将获取的距离数值赋值给滚动条对象,动画执行完毕使用回调将滚动状态修改为1；
        $('body,html').animate({scrollTop:top},250,function () {
            state=1;
        }); //点击按钮让其回到页面顶部


    });
});