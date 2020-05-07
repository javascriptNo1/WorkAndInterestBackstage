$(function(){

    new Vue({
        el:'.note',
        data(){
            return{
                paperdeli:'',
                page:0,
                classify:'',
                keyword:'',
                classlayarr: [],
                child:[''],
                overt:'',
                title:'所有试题管理',
                userid:''
            }
        },
        mounted(){
            let _this = this
            this.page = this.getUrlParameter('page') || 0
            this.show()
            this.get().then((data)=>{
                data.unshift({
                    maxclass:'全部',
                    minclass: ['']
                })
                this.classlayarr = data
            })
            $('#style').change(function(e){
                _this.child = _this.classlayarr[e.target.value].minclass
                _this.classify = _this.classlayarr[e.target.value].minclass[0]
                _this.page = 0
                _this.show()
            });

            $('#minstyle').change(function(){
                _this.page = 0
                _this.show()
            });

            $('#overt').change(function(){
                _this.page = 0
                _this.show()
            });

            // 搜索框事件
            $('#but').on('click',()=>{
                this.page = 0
                this.show()
            })

            // 搜索框事件
            $('#search').keydown(function(e){
                if(e.keyCode===13){
                    _this.page = 0
                    _this.show()
                }
            });



				// 上一页
            $('#fpage').click(function(){
                if(_this.page!==0){
                    _this.page-=1;
                    _this.show()
                }
            })
				// 下一页
            $('#lpage').click(function(){
                if(_this.paperdeli.length !== _this.page+1){
                    _this.page+=1;
                    _this.show()
                }
            })

            //删除数据
            $('#tbody').on('click','.rebut',function(){
                let index = this.getAttribute('data-index')
                $.ajax({
                    type:"get",
                    url:"/xcx/admindeleteTopic.php?id="+this.getAttribute('data-id'),
                    async:true,
                    datatype:'json',
                    success:function(data){
                        if(data=== '1'){
                            _this.paperdeli.list.splice(index,1)
                        }
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
        },
        methods:{
            show(n,s){
                this.userid = this.getUrlParameter('userid')
                if (this.userid){
                    this.title = '个人题目管理'
                    $.get(`/xcx/getsearchtopic.php?page=${this.page}&classify=${this.classify}&keyword=${this.keyword}&overt=${this.overt}&userid=${this.userid}`, (data)=> {
                        this.paperdeli = data
                    })
                }
                else {
                    $.get(`/xcx/getsearchtopic.php?page=${this.page}&classify=${this.classify}&keyword=${this.keyword}&overt=${this.overt}`, (data)=> {
                        this.paperdeli = data
                    })
                }
            },
            getUrlParameter(key) {
                let urlarr=location.search.substring(1).split('&')
                for(let i=0;i<urlarr.length;i++){
                    if(key===urlarr[i].split('=')[0]){
                        return urlarr[i].split('=')[1]
                    }
                }
            },
            get(){
                return new Promise((resolve,reject)=>{
                    $.ajax({
                        type:"get",
                        url:"/xcx/getallclassfiy.php",
                        async:true,
                        datatype:'json',
                        success:function(data){
                            resolve(data)
                        }
                    });
                })
            },
        }
    })


});