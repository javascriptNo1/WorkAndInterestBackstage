new Vue({
    el:'.mainbox',
    data(){
        return{
            data:[],
            state:1
        }
    },
    mounted(){
        this.get().then((data)=>{
            data.map((itme)=>{
                itme.state = 1
                itme.butmagess = '修改'
            })
            this.data = data
        })
    },
    methods:{
        onaddmaxclass(){
            this.add().then(()=>{
                this.get().then((data)=>{
                    data.map((itme)=>{
                        itme.state = 1
                        itme.butmagess = '修改'
                    })
                    this.data = data
                })
            })
        },
        ondelmaxclass(e){
            if (confirm("确定删除该分类吗？")) {
                this.delmaxclass(e.target.getAttribute('data-id')).then((data)=>{
                    if (data === '1'){
                        this.get().then((data)=>{
                            data.map((itme)=>{
                                itme.state = 1
                                itme.butmagess = '修改'
                            })
                            this.data = data
                        })
                    }
                })
            }
        },
        onset(e){
          let id = e.target.getAttribute('data-id')
            this.data.map((itme)=>{
                if (id === itme._id){
                    if (itme.state === 1){
                        itme.state = 2
                        itme.butmagess = '完成'
                    }
                    else {
                        itme.state = 1
                        itme.butmagess = '修改'
                        this.set(itme).then((data)=>{
                           if (data === '1'){
                               alert('修改成功')
                           }
                        })
                    }
                }

            })
        },
        ondel(e){
            let id = e.target.getAttribute('data-id')
            let index = e.target.getAttribute('data-index')
            this.data.map((itme)=>{
                if (id === itme._id){
                    itme.minclass.splice(index,1)
                }
            })
        },
        onadd(e){
            let id = e.target.getAttribute('data-id')
            this.data.map((itme)=>{
                if (id === itme._id){
                    itme.minclass.push('')
                }
            })
        },
        oninput(e){
            let id = e.target.getAttribute('data-id')
            let index = e.target.getAttribute('data-index')
            this.data.map((itme)=>{
                if (id === itme._id){
                    itme.minclass.splice(index,1,e.target.value)
                }
            })
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
        set(data){
            return new Promise((resolve,reject)=>{
                $.ajax({
                    type:"post",
                    url:"/xcx/setallclassfiy.php",
                    async:true,
                    datatype:'json',
                    data:{
                        id:data._id,
                        maxclass:data.maxclass,
                        minclass:JSON.stringify(data.minclass)
                    },
                    success:function(data){
                        resolve(data)
                    }
                });
            })
        },
        add(){
            return new Promise((resolve,reject)=>{
                $.ajax({
                    type:"get",
                    url:"/xcx/addallclassfiy.php",
                    async:true,
                    datatype:'json',
                    data:{
                        maxclass:'',
                        minclass:['']
                    },
                    success:function(data){
                        resolve(data)
                    }
                });
            })
        },
        delmaxclass(id){
            return new Promise((resolve,reject)=>{
                $.ajax({
                    type:"get",
                    url:"/xcx/delmaxclass.php",
                    async:true,
                    datatype:'json',
                    data:{
                        id:id
                    },
                    success:function(data){
                        resolve(data)
                    }
                });
            })
        },
    }
})