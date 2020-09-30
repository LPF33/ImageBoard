(function() {

    const hashcheck = hashSlice => {
        if(!Number.isNaN(parseInt(hashSlice))){
            return hashSlice;
        } else if(hashSlice.length>0) {
            return null;
        } else {
            return hashSlice;
        }
    }

    const hashcheck2 = hashSlice => {
        if(!Number.isNaN(parseInt(hashSlice))){
            return null;
        } else if(hashSlice.length>0) {
            return hashSlice;
        } else {
            return null;
        }
    }

    new Vue({
        el: "#main",

        data: {
            title: "",
            description:"",
            username:"",
            file: "",
            tags:"",
            images : [],

            selectedImageId : hashcheck(location.hash.slice(1)), 

            selectedTag: hashcheck2(location.hash.slice(1)),

            lastID : (new Date()).toISOString()
        },

        mounted(){
            axios
                .get(`/images/${this.lastID}`)
                .then(result => { 
                    for(let item of result.data){
                        item.tags = item.tags.split(",");
                    }
                    this.images = result.data;
                    this.lastID = result.data[2].created_at;
            });

            addEventListener("hashchange", () => { 
                this.selectedImageId = hashcheck(location.hash.slice(1)); 
                this.selectedTag= hashcheck2(location.hash.slice(1));           
            })
        },
        methods: {
            fileSelected: function(e){ 
                this.file = e.target.files[0];
            },
            upload: function(e) {
                const formData = new FormData();
            formData.append("title", this.title);
            formData.append("description", this.description);
            formData.append("username", this.username);
            formData.append("file", this.file);
            formData.append("tags", this.tags);

            axios.post("/upload", formData)
                .then( result => {
                    result.data.image.tags = result.data.image.tags.split(",");
                    this.images.unshift(result.data.image);

                    document.querySelector("#title").value = "";
                    this.title = "";
                    document.querySelector("#file").value = "";
                    this.file = ""; 
                    document.querySelector("#username").value = "";
                    this.username = "";
                    document.querySelector("#description").value = "";
                    this.description = "";
                    document.querySelector("#tags").value = "";
                    this.tags = "";

                });
            },
            nextImages: function(){
                axios.get(`/images/${this.lastID}`)
                    .then( result => {

                        for(let item of result.data){
                            item.tags = item.tags.split(",");
                            this.images.push(item);
                        }  
                        if(result.data[2]){
                            this.lastID = result.data[2].created_at;
                        } else {
                            this.lastID = "";
                            document.querySelector("#pagination").style.display = "none";
                        }                
                        
                    });
            }           
        }
    });

    Vue.component("view-image", {
        template: "#template-view-image",
        data: function(){
            return {                            
                comment:"",
                Username:"",
                allComments: [],
                image:"",
                commentid:"",
                replyUser:"",
                Username2:"",
                allReply:[]
            }
        },
        props: ["imageid"],
        mounted(){
            axios
                .get(`/imageData/${this.imageid}`)
                .then(result => {
                    this.allComments = result.data.comments;
                    this.image = result.data.image;
                    this.allReply = result.data.reply;
                })
                .catch( error => window.location.hash = "#");
        },
        watch:{
            imageid: function(){
                    axios
                        .get(`/imageData/${this.imageid}`)
                        .then(result => {
                            this.allComments = result.data.comments;
                            this.image = result.data.image;
                            this.allReply = result.data.reply;
                        })
                        .catch( error => window.location.hash = "#");
            }
        },
        methods: {
            closeImage: function(){
                history.pushState(null, null, "#");
                this.$emit("close");
            }, 
            sendComment: function(){

                if(this.comment && this.Username){
                        const commentData = {
                        "username": this.Username,
                        "commenttext": this.comment,
                        "image_id": this.imageid,
                    };                

                    axios.post("/saveComments", commentData)
                        .then( result => {
                            this.allComments.unshift(
                                result.data.comment
                        );

                    });
                }                
                
                document.querySelector("#comment").value = "";
                this.comment = "";
                document.querySelector("#Username").value = "";
                this.Username = "";                
            },
            deleteImage: function(){
                axios
                    .get(`/deleteImage/${this.imageid}`)
                    .then(result => {                             
                        window.location.reload();
                    })
            },
            closeReply: function(e){
                this.commentid=null;
            },
            sendReply: function(){
                if(this.replyUser && this.Username2){
                    const replyData = {
                    "username": this.Username2,
                    "replytext": this.replyUser,
                    "comment_id": this.commentid,
                    "image_id":this.imageid
                };                

                axios.post("/saveReply", replyData)
                    .then( result => {
                        this.allReply.unshift(
                            result.data.reply
                    );

                });
            }                
            
            document.querySelector(".replyUser").value = "";
            this.replyUser = "";
            document.querySelector(".Username2").value = "";
            this.Username2 = "";
            }        
        }
    });

    Vue.component("view-tags", {
        template: "#template-view-tags",
        data: function(){
            return { 
                tagimages: []
            }
        },
        props: ["tagtext"],
        mounted(){
            axios
                .get(`/search/${this.tagtext}`)
                .then(result => { 
                    for(let item of result.data.images){
                        item.tags = item.tags.split(",");
                    }
                    this.tagimages = result.data.images;
                })
                .catch( error => window.location.hash = "#");
        },
        watch:{
            tagtext: function(){
                axios
                .get(`/search/${this.tagtext}`)
                .then(result => { 
                    for(let item of result.data.images){
                        item.tags = item.tags.split(",");
                    }
                    this.tagimages = result.data.images;
                })
                .catch( error => window.location.hash = "#");
            }
        },
        methods: {
            closeTagImages: function(){
                history.pushState(null, null, "#");
                this.$emit("close");
            }
        }   
    
    });


})();