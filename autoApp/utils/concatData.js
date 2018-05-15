/**
 * s: subBrand data
 * m: model data
 * */
module.exports = function (s, m) {
   if(s.length === 0) {
       return {
           slist: null,
           mlist: m
       };
   }
   let slist = [];
   s.forEach(function (sv) {
       var sbid = sv.sohuId;
       var mArr = [];
       m.forEach(function (mv){
           if(mv.subBrandId === sbid) {
               mArr.push(mv);
           }
       });
       slist.push({
           subBrandName: sv.name,
           models: mArr
       });
   })
    return {
        slist: slist,
        mlist: null
    };
}