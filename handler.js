class Handler {
  constructor(){
    this.GET={};
    this.POST={};
  }
  addGetHandler(url,handler){
    this.GET[url]=handler;
  }
  addPostHandler(url,handler){
    this.POST[url]=handler;
  }
}

module.exports=Handler;
