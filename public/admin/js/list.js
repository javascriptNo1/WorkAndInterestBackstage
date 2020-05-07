$(function(){
				
	var page;

	function show(n,s){
		n?n=n:n=1;
		
		var style=$('#style').val();
		
		 $.get('/admin/newlist.php?style='+style+'&page='+n+'&search='+s,function (data) {
    	page=data.pop();
    	console.log(page)
    	var arr=[];
    	arr.length=page;
    	
    	
    	
    	var html=template('molde',{'list':data});
    	$('#tbody').html(html);
      	
      	var pagehtml=template('pagemolde',{'list':arr});
      	
      	$('.p').remove();
      	$('#lpage').before(pagehtml);
      	$('.p').eq(n-1).addClass('on')
    })
	}
	show();
//				搜索
	$('#style').change(function(){
        show();
	});

	// 搜索框事件
	$('#search').keydown(function(e){
		var s=$(this).val();
		if(e.keyCode==13){
			show(1,s);
		}
	});


	
//				上一页
	$('#fpage').click(function(){
		var x=parseInt($('.on').text())-1;
		if(x>=1){
			show(x);
		}
		
		
	})
//				下一页
	$('#lpage').click(function(){
		var x=parseInt($('.on').text())+1;
		if(x<=page){
			show(x);
		}
	})
//				单页
	$('#pages').on('click','.p',function(){
		var x=parseInt($(this).text());
		show(x);
	})
	
//				删除数据
	$('#tbody').on('click','.rebut',function(){
		
		$.ajax({
			type:"get",
			url:"remove.php?id="+$(this).data('id'),
			async:true,
			datatype:'json',
			success:function(data){
				show();
			}
		});
		
	});
	
	
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
});