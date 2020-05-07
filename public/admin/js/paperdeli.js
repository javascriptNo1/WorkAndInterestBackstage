$(function(){
    new Vue({
        el:'.note',
        data(){
            return{
                paperdeli:''
            }
        },
        mounted(){
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
                $.get('/xcx/admingetTestQuestions.php?paperid='+this.getUrlParameter('id'), (data)=> {
                    this.paperdeli = data;
                })
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