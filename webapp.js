const Handler=require('./handler.js');

let redirect = function(path){
  console.log(`Redirecting to ${path}`);
  this.statusCode=302;
  this.setHeader('location',path);
  this.end();
};

let invoke = function(req,res){
  let handler = this._handler[req.method][req.url];
  if(res.finished)return;
  if(handler){
    handler(req,res);
  }
};

let urlIsOneOf = function(urls){
  return urls.includes(this.url);
};

const toKeyValue = kv=>{
    let parts = kv.split('=');
    return {key:parts[0].trim(),value:parts[1].trim()};
};
const accumulate = (o,kv)=> {
  o[kv.key] = kv.value;
  return o;
};

const parseBody=(text)=>{
  return text && text.split('&').map(toKeyValue).reduce(accumulate,{}) || {};
};
const parseCookies = text=> {
  try {
    return text && text.split(';').map(toKeyValue).reduce(accumulate,{}) || {};
  }catch(e){
    return {};
  }
}

const initialize=function(){
  this._handler=new Handler();
  this._preprocess=[];
  this._postprocess=[];
};

const get =function(url,handler){
  this._handler.addGetHandler(url,handler);
};

const post =function(url,handler){
  this._handler.addPostHandler(url,handler);
};

const use = function(handler){
  this._preprocess.push(handler);
};

const postProcess = function(handler){
  this._postprocess.push(handler);
};

const main = function(req,res){
  res.redirect=redirect.bind(res);
  req.urlIsOneOf=urlIsOneOf.bind(req);
  debugger;
  req.cookies = parseCookies(req.headers.cookie) || '';
  let content="";
  req.on('data',data=>content+=data.toString())
  req.on('end',()=>{
    req.body = parseBody(content);
    runProcessors(req,res,this._preprocess);
    if(res.finished) return;
    invoke.call(this,req,res);
    runProcessors(req,res,this._postprocess);
    if(!res.finished){
      res.statusCode = 404;
      res.write('File not found!');
      res.end();
    }
  });
};

const runProcessors = function(req,res,processors){
  processors.forEach(handler=>{
    if(res.finished) return;
    handler(req,res);
  });
}

const create=()=>{
  let rh=(req,res)=>{
    main.call(rh,req,res);
  }
  initialize.call(rh);
  rh.get=get;
  rh.post=post;
  rh.use=use;
  rh.postProcess=postProcess;
  return rh;
};

exports.create=create;
