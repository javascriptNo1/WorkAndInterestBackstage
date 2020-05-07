$(function(){
    new Vue({
        el:'.note',
        data(){
            return{
                topicdeli:'',
                userid:'',
                page:''
            }
        },
        mounted(){
            this.userid = this.getUrlParameter('userid')
            this.page = this.getUrlParameter('page')
            this.show()
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
            show(){
                $.get('/xcx/admingetTopicdeli.php?id='+this.getUrlParameter('id'), (data)=> {
                    this.topicdeli = data;
                })
            },
             getUrlParameter(key) {
                let urlarr=location.search.substring(1).split('&')
                for(let i=0;i<urlarr.length;i++){
                    if(key===urlarr[i].split('=')[0]){
                        return urlarr[i].split('=')[1]
                    }
                }
            },
        }
    })

});