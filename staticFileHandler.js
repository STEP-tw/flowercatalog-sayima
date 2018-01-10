let fs = require('fs');
const isFile = function(path){
  try{
    let stat= fs.statSync(path);
    return stat.isFile();
  }catch(e){
    return false;
  }
};

let serveStaticFile =(req,res)=>{
  let path='public'+req.url;
  if(isFile(path) && req.method=='GET'){
    let contentType=getContentType(req.url);
    let data=fs.readFileSync(path);
      res.writeHead(200,{'Content-Type':contentType});
      res.write(data);
      res.end();
  }
};

let getContentType = function(path){
  let contentTypes ={
    '.js' : 'text/javascript',
    '.html':'text/html',
    '.css' : 'text/css',
    '.jpg' :'image/jpg',
    '.jpeg':'image/jpeg',
    '.gif':'image/gif',
    '.pdf':'application/pdf'
  };
  let extension=path.slice(path.lastIndexOf('.'));
  if(contentTypes[extension])
    return contentTypes[extension];
  return 'text/plain';
};
exports.serveStaticFile=serveStaticFile;
