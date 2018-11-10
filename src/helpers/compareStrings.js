

module.exports = function(str, strToCompare, returnValue) {
  //debugger
  if(str.trim().toUpperCase() === strToCompare.trim().toUpperCase()) {
     return returnValue;
  }
  // else {
  //   return 'disabled';
  // }
}