$(function(){

    new Vue({
        el:'.note',
        data(){
            return{
                paperdeli:{},
                page:0,
                classify:'',
                keyword:'',
                classlayarr: [
                    {
                        maxclass:'全部',
                        minclass: ['']
                    },
                    {
                        maxclass:'娱乐',
                        minclass: ['电影', '游戏', '动漫', '小说', '漫画']
                    },
                    {
                        maxclass: '生活',
                        minclass: ['饮食', '健康', '常识']
                    },
                    {
                        maxclass: '职业',
                        minclass: ['IT', '销售', '运维']
                    },
                    {
                        maxclass: '综合',
                        minclass: ['综合']
                    },
                ],
                child:[''],
                overt:'',
                title:'所有试卷管理',
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
                this.page = 0
                _this.show()
            });

            $('#overt').change(function(){
                _this.page = 0
                _this.show()
            });

            // 搜索框事件
            $('#but').on('click',()=>{
                _this.page = 0
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
                    url:"/xcx/admindeletepaper.php?id="+this.getAttribute('data-id'),
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
            show(n,s){
                this.userid = this.getUrlParameter('id')
                if (this.userid) {
                    this.title = '个人试卷管理'
                    $.get(`/xcx/getmypaper.php?page=${this.page}&classify=${this.classify}&keyword=${this.keyword}&overt=${this.overt}&userid=${this.userid}`, (data) => {
                        let obj = {
                            list:data,
                            length:1
                        }
                        this.paperdeli = obj
                    })
                }
                else {
                    $.get(`/xcx/getsearchpaper.php?page=${this.page}&classify=${this.classify}&keyword=${this.keyword}&overt=${this.overt}`, (data)=> {
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
            }
        }
    })


});