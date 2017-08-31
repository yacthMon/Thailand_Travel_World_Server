let blessed = require('blessed');

class Monitor {
  constructor() {
    this.debugMode = false;
    this.screen = blessed.screen()
    this.statusBody = blessed.box({
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      tags: true
    });
    this.body = blessed.box({
      top: 1,
      left: 0,
      width: '80%',
      height: '97%',
      tags: true,
      scrollable:true,
    });

    this.screen.append(this.statusBody);
    this.screen.append(this.body);

    this.screen.key(['escape', 'q', 'C-c'], function(ch, key) {
      return process.exit(0);
    });

    this.screen.key(['C-d'], (ch, key)=>{
      if(this.debugMode){
        this.log("=== Debug mode disabled ===");
        this.disableDebugMode();
      }else{
        this.log("=== Debug mode enabled ===");
        this.enableDebugMode();
      }
    });
  }
  enableDebugMode(){
    this.debugMode = true;
  }
  disableDebugMode(){
    this.debugMode = false;
  }
  status(text) {
    this.statusBody.setLine(0, '{black-fg}{white-bg}' + text + '{/white-bg}{/black-fg}');
    this.screen.render();
  }
  info(text){
    this.body.pushLine(text);
    this.body.setScroll(this.body.getScrollHeight());
    this.screen.render();
  }
  debug(text){
    if(this.debugMode){
      this.body.pushLine("[" + this.currentTime()+"] Debug : "+text);
      this.body.setScrollPerc(100);
      this.screen.render();
    }
  }
  log(text) {
    this.body.pushLine("[" + this.currentTime()+"] "+text);
    this.body.setScrollPerc(100)
    // this.body.setScroll(this.body.getScrollHeight());
    // this.body.pushLine("Scroll at : " + this.body.getScroll() + " Height" + this.body.getScrollHeight())
    this.screen.render();
  }
  currentTime(){
    let time = new Date();
    return ((time.getHours() < 10)?"0":"") + time.getHours() +":"+ ((time.getMinutes() < 10)?"0":"") + time.getMinutes() +":"+ ((time.getSeconds() < 10)?"0":"") + time.getSeconds();
  }
}
module.exports = Monitor;
//
// var c = 1;
// setInterval(function() {
//   status((new Date()).toISOString());
//   log('This is line #' + (c++));
// }, 100);
