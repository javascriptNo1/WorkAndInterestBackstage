$(function(){

    new Vue({
        el:'.note',
        data(){
            return{
                paperdeli:'',
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
                overt:'false',
                sort:'timestamp'
            }
        },
        mounted(){
            let _this = this
            this.show()

            // $('#style').change(function(e){
            //     _this.child = _this.classlayarr[e.target.value].minclass
            //     _this.classify = _this.classlayarr[e.target.value].minclass[0]
            //     _this.show()
            // });

            $('#sort').change(function(){
                _this.page = 0
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

            //拉黑用户
            $('#tbody').on('click','.rebut',function(){
                let index = this.getAttribute('data-index')
                $.ajax({
                    type:"get",
                    url:"/xcx/Blackusers.php?id="+this.getAttribute('data-id'),
                    async:true,
                    datatype:'json',
                    success:function(data){
                        if(data=== '1'){
                            _this.paperdeli.list.splice(index,1)
                        }
                    }
                });

            });

            //取消拉黑用户
            $('#tbody').on('click','.rebut2',function(){
                let index = this.getAttribute('data-index')
                $.ajax({
                    type:"get",
                    url:"/xcx/unBlackusers.php?id="+this.getAttribute('data-id'),
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
                $.get(`/xcx/getuserdata.php?page=${this.page}&keyword=${this.keyword}&overt=${this.overt}&timestamp=${this.sort}`, (data)=> {
                    data.list.map(function (itme) {
                        if (itme.gender === 1) {
                            itme.gender = '男'
                        }
                        else if(itme.gender === 2){
                            itme.gender = '女'
                        }
                        else {
                            itme.gender = '未知'
                        }
                    })
                    this.paperdeli = data
                })
            }
        }
    })


});