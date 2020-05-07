$(function(){

    // 初次加载调用函数
    page();
    footerpage();

    // 调用获取所有文章分类数目函数
    stylesum();

    // 定义变量存储分页页数
    var a;

    // 分页函数
    function page(n,style,search) {

        // 定义默认页数
        n ?  n=n : n=1;


        // 设置默认查询全部类型
        style?style=style:style='';



        // 发送Ajax请求
        $.ajax({
            url:'/admin/newlist.php?page='+n+'&search='+search+'&style='+style,
            type:'get',
            async:false, //外部需要使用数据，所以使用同步模式
            success:function(data){

                // 弹出分页页数
                a=data.pop();
                var list=$("#wlist");

                // 循环输出文章列表
                list.html('');

                for (var i=0;i<data.length;i++){
                    // 定义模板
                    var html='<li>' +
                        ' <h3><a data-id="'+data[i]._id+'" class="articletitle" href="article.html?id='+data[i]._id+'">'+data[i].title+'</a></h3>' +
                        '<div class="content">'+data[i].content+'</div>' +
                        '<p class="wlistfooer">' +
                        '<span class="style">' +
                        '<img src="../../dist/images/newsbg01.png" alt="">' +
                        '<span>'+data[i].classify+'</span>' +
                        '</span>' +
                        '<span class="time">' +
                        '<img src="../../dist/images/newsbg02.png" alt="">' +
                        '<span>'+data[i].ctime+'</span>' +
                        '</span>' +
                        '<span class="hist">' +
                        '<img src="../../dist/images/newsbg04.png" alt="">' +
                        '<span>浏览（<span class="histsum'+data[i]._id+' histsum">'+data[i].browse+'</span>）</span>' +
                        '</span>' +
                        '</p>' +
                        ' </li>';
                    // 输出模板
                    list.append(html);
                }
            }

        })

    }

    // 所有文章分类数目
    function stylesum() {

       $.get('admin/stylesum.php',function(data){
         $('.allsum').html(data.all);
         $('.javascriptsum').html(data.javascript);
         $('.csssum').html(data.css);
         $('.htmlsum').html(data.html);
         $('.Nodesum').html(data.Node);
         $('.Mongodbsum').html(data.Mongodb);
         $('.toolsum').html(data.tool);
         $('.ambientsum').html(data.ambient);
         $('.othersum').html(data.other);
       })
    }

    // 底部页码函数
    function footerpage(){

        // 输出前清除之前的页码
        $('.pageli').remove();
        // 循环输出页码
        var firstpage=$('.firstpage');

        for(let i=a;i>0;i--){

            // 定义模板
            let html='<li class="pageli"><a href="#">'+i+'</a></li>';
            // 输出模板
            firstpage.after(html)
        }

        // 默认选择第一页
        $('.pageli:eq(0)').addClass('active');
    }

    // 文章分页列表交互
    $('.cf .list-group-item ').on('click',function () {
        // 前端交互
        $(this).addClass('active').siblings().removeClass('active');

        // 获取当前点击的类型
        var style=$(this).data('style');
        // 调用获取数据函数传入参数和类型
        page(1,style);

        // 调用获取全部页数函数
        footerpage();

        // 对根据类型查询的数据进行分页，将隐藏的分页显示出来
        $('.pagebut').css('display','block');
    });

    // 单击具体分页按钮的交互
    $('.pagination').on('click','.pageli',function(e){
        // 前端交互
        $(this).addClass('active').siblings().removeClass('active');
        // 阻止a便签的默认事件
        e.preventDefault();
        // 获取页数
        var p=$(this).find('a').html();

        // 获取当前文章类型
        var style=$('.list-group-item.active').data('style');


        // 调用数据函数传入页数
        page(p,style);
    });

    // 单击上一页的按钮交互
    $('.firstpage').on('click',function(){

        // 判断上一页是否是页码
        if(!isNaN($('.pageli.active').prev().find('a').html())){

            // 获取当前激活的页数并减一
            var p=$('.pageli.active').find('a').html()-1;

            // 激活当前页数的上一页
            $('.pageli.active').removeClass('active').prev().addClass('active');

            // 获取当前文章类型
            var style=$('.list-group-item.active').data('style');

            // 调用数据函数传入页数
            page(p,style);
        }


    })

    // 单击下一页的按钮交互
    $('.lastpage').on('click',function(){

        // 判断上一页是否是页码

        if(!isNaN($('.pageli.active').next().find('a').html())){

            // 获取当前激活的页数并加一
            var p=parseInt($('.pageli.active').find('a').html())+1;

            // 激活当前页数的下一页
            $('.pageli.active').removeClass('active').next().addClass('active');

            // 获取当前文章类型
            var style=$('.list-group-item.active').data('style');

            // 获取搜索框的值
            // var search=$('#search').val();

            // footerpage();

            // 调用数据函数传入页数
            page(p,style);
        }



    })

    // 搜索框回车事件
    $('#search').on('keydown',function(e){

       if(e.keyCode===13){
           // 获取输入框的值
           var search=$(this).val();
            if (search===''){
                alert('关键字不能为空')
                return
            }
           // 获取当前类型
           var style=$('.list-group-item.active').data('style');

           // 调用函数传入搜索条件和类型
           page(1,style,search);

           // footerpage()

           // 隐藏页码，对搜索的内容不进行分页display: block;
           $('.pagebut').css('display','none');
       }
    });

    // 搜索框的确认按钮
    $('.searchbut').on('click',function(){
        // 获取输入框的值
        var search=$('#search').val();
        if (search===''){
            alert('关键字不能为空')
            return
        }
        // 获取当前类型
        var style=$('.list-group-item.active').data('style');

        // 调用函数传入搜索条件和类型
        page(1,style,search);

        // 隐藏页码，对搜索的内容不进行分页display: block;
        $('.pagebut').css('display','none');
    });

    // 搜索框键入事件
    // $('#search').on('input',function(){
    //     // 获取输入框的值
    //     var search=$(this).val();
    //
    //     // 获取当前类型
    //     var style=$('.list-group-item.active').data('style');
    //
    //     // 调用函数传入搜索条件和类型
    //     page(1,style,search);
    //
    //     // footerpage()
    //
    //     // 隐藏页码，对搜索的内容不进行分页display: block;
    //     $('.pagebut').css('display','none');
    // });

    // 点击文章链接时统计浏览次数
    $('#wlist').on('click','.articletitle',function(){
        // 获取id
        var id=$(this).data('id');
        // 发送ajax请求
        $.get('admin/browse.php?id='+id,function(data){

            // 更新增加后的浏览次数
            $('.histsum'+id).html(data.browse);
        })
    })

    // 移动端交互
    $('#showbut').on('click',function(){
        if($('.list-group').css('right')==='0px'){
            $('.list-group').css('right','-50%');
        }
        else {
            $('.list-group').css('right','0');
            $('#showbut').css('right','-10%');
        }
    });

    // $('.cr,.footer').on('click',function(){
    //     $('.list-group').css('right','-50%');
    // });

    $('.cr,.footer').on('click',function(){
        $('.list-group').css('right','-50%');
        $('#showbut').css('right','0');
    });

//     //移动端的touch触摸交互
//     var st=0;
//     var end=0;
//     var le=30;
//     $('.cr,.footer').on('touchstart',function(e){
// 			// console.log('开始',e.originalEvent.changedTouches[0].clientX);
//         st=e.originalEvent.targetTouches[0].clientX;
//
//         if(st - end > le ){
//             // $('.xsbtn').click();
//         }
//     })
//
//     $('.cr,.footer').on('touchend',function(e){
// //			console.log('结束',e.originalEvent.changedTouches[0].clientX);
//         end=e.originalEvent.changedTouches[0].clientX;
//         if(end - st > le){
//             $('.list-group').css('right','-50%');
//         }
//         else {
//             $('.list-group').css('right','0%');
//         }
//     })
});