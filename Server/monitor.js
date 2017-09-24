let blessed = require('blessed');
const fs = require('fs');
class Monitor {
  constructor() {
    this.logPath = "./log/";
    
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
      scrollable: true,
    });

    this.screen.append(this.statusBody);
    this.screen.append(this.body);

    this.screen.key(['escape', 'q', 'C-c'], function (ch, key) {
      return process.exit(0);
    });

    this.screen.key(['C-d'], (ch, key) => {
      if (this.debugMode) {
        this.log("=== Debug mode disabled ===");
        this.disableDebugMode();
      } else {
        this.log("=== Debug mode enabled ===");
        this.enableDebugMode();
      }
    });

    this.screen.key(['C-s', (ch, key) => {
      this.log("             .,-:;//;:=,");
      this.log("         . :H@@@MM@M#H/.,+%;,");
      this.log("      ,/X+ +M@@M@MM%=,-%HMMM@X/,");
      this.log("     -+@MM; $M@@MH+-,;XMMMM@MMMM@+-");
      this.log("    ;@M@@M- XM@X;. -+XXXXXHHH@M@M#@/.");
      this.log("  ,%MM@@MH ,@%=            .---=-=:=,.");
      this.log("  -@#@@@MX .,              -%HX$$%%%+;");
      this.log(" =-./@M@M$                  .;@MMMM@MM:");
      this.log(" X@/ -$MM/                    .+MM@@@M$");
      this.log(",@M@H: :@:                    . -X#@@@@-");
      this.log(",@@@MMX, .                    /H- ;@M@M=");
      this.log(".H@@@@M@+,                    %MM+..%#$.");
      this.log(" /MMMM@MMH/.                  XM@MH; -;");
      this.log("  /%+%$XHH@$=              , .H@@@@MX,");
      this.log("   .=--------.           -%H.,@@@@@MX,");
      this.log("   .%MM@@@HHHXX$$$%+- .:$MMX -M@@MM%.");
      this.log("     =XMMM@MM@MM#H;,-+HMM@M+ /MMMX=");
      this.log("       =%@M@M#@$-.=$@MM@@@M; %M%=");
      this.log("         ,:+$+-,/H#MMMMMMM@- -,");
      this.log("               =++%%%%+/:-.");
    }])

    this.screen.key(['C-a'], (ch, key) => {
      // making error      
      logPath.ASD();      
    });
    this.screen.key(['C-x'], (ch, key) => {
      // making error            
      console.error("5555 damnit ", 55552);
    });

    //== Log ===========================================
    this.logNormal = fs.createWriteStream(this.logPath + "logs.txt", { flags: 'a' });
    this.logError = fs.createWriteStream(this.logPath + "errors.txt", { flags: 'a' });
    this.logErrorCount = 0;
    let startServerText = "\r\nServer start : " + this.fullCurrentTime() + "\r\n";
    let shurdownServerText = "Server Shutingdown on " + this.fullCurrentTime();

    this.logNormal.write(startServerText);
    this.logError.write(startServerText);
    this.error = (err,code) => {
      let errorCount = this.logErrorCount++;
      this.logError.write(this.fullCurrentTime() + " [" + errorCount + "]\r\n");
      this.logError.write((((err && err.stack) ? err.stack : err)));
      this.logError.write("\r\n");
      this.log("{red-fg}[" + (code?"Error "+code:"uncaughtException" )+"]{/red-fg} update in errors log " + this.fullCurrentTime() + ", error number : [" + errorCount + "]");
    }
    console.error = this.error;
    process.on('uncaughtException', this.error);

    process.on('exit', (code) => {
      this.logNormal.write(shurdownServerText + " with code : " + code);
      this.logError.write(shurdownServerText + " with code : " + code);
    });

  }

  enableDebugMode() {
    this.debugMode = true;
  }

  disableDebugMode() {
    this.debugMode = false;
  }

  status(text) {
    this.statusBody.setLine(0, '{black-fg}{white-bg}' + text + '{/white-bg}{/black-fg}');
    this.screen.render();
  }

  info(text) {
    this.body.pushLine(text);
    this.body.setScroll(this.body.getScrollHeight());
    this.screen.render();
  }

  debug(text) {
    if (this.debugMode) {
      this.body.pushLine("[" + this.currentTime() + "] Debug : " + text);
      this.body.setScrollPerc(100);
      this.screen.render();
    }
  }

  log(text) {
    let logText = "[" + this.currentTime() + "] " + text
    this.body.pushLine(logText);
    this.body.setScrollPerc(100);
    this.logNormal.write(logText + "\r\n");
    this.screen.render();
  }
  currentTime() {
    let time = new Date();
    return ((time.getHours() < 10) ? "0" : "") + time.getHours() + ":" + ((time.getMinutes() < 10) ? "0" : "") + time.getMinutes() + ":" + ((time.getSeconds() < 10) ? "0" : "") + time.getSeconds();
  }

  fullCurrentTime() {
    let time = new Date();
    return "[" + time.getDate() + "/" + (time.getMonth() + 1) + "/" + time.getFullYear() + "] " + this.currentTime() + ":" + time.getMilliseconds();
  }
}
module.exports = Monitor;
//
// var c = 1;
// setInterval(function() {
//   status((new Date()).toISOString());
//   log('This is line #' + (c++));
// }, 100);
