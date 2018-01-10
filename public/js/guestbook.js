const getFormattedComments=function(comments){
  let content=` <pre> `;
  comments.map(function(element){
    content+=`
    Date:${element.date}
    Name:${element.name}
    Comment:${element.comment} <br><br> `;
  });
  content+=` </pre> `;
  return content;
};

let getComments=()=>{
  function loadComments(){
    let comments=JSON.parse(this.response);
    document.querySelector('#commentDiv').innerHTML = getFormattedComments(comments);
    console.log(this.response);
  }
  var oReq = new XMLHttpRequest();
  oReq.addEventListener("load", loadComments);
  oReq.open("get", "/comments");
  oReq.send();

};
window.onload=getComments;
