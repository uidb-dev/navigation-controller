"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var changePage = function changePage(goToPage, options) {
  var fthis = undefined;
  try {
    if (goToPage && undefined.props.children.filter(function (x) {
      return x.key === goToPage;
    }).length === 0) {
      if (fthis.props.errorPageKey) {
        goToPage = fthis.props.errorPageKey;
      } else {
        goToPage = undefined.state.homePageKey;
      }
      console.error("goToPage ", goToPage, " undefined");
      fthis.onError("page undefined");
    }

    //סיום האפליקציה, סגור
    if (undefined.state.historyPages.length === 1 && goToPage === undefined) {
      console.log('"window.navigator.app.exitApp()"');
      // fthis.showSwalLater ?
      //     fthis.myChildrens.swal.runSwal(true) :
      if (undefined.props.beforExit) if (!undefined.props.beforExit()) return;
      window.navigator.app.exitApp();
      return;
    }

    if (goToPage === undefined) {
      console.error("navigator error: changePage function need goToPage parameter.");
      return;
    }

    if (fthis.listLevelPages[goToPage] === undefined) {
      console.error("navigator error, at changePage. goToPage parameter not found in the pages list.");
      return;
    }

    undefined.props.children.filter(function (child) {
      return (typeof child === "undefined" ? "undefined" : _typeof(child)) === "object";
    }).forEach(function (child) {
      if (child.props.kill) {
        fthis.historyPages = fthis.historyPages.filter(function (x) {
          return x !== child.key;
        });
      }
    });

    undefined.setState({ historyPages: undefined.historyPages });

    var fromPage = "" + undefined.historyPages[undefined.historyPages.length - 1] + "";

    var aniTime = 250;

    if (undefined.props.children.filter(function (x) {
      return x.key === goToPage;
    })[0].props.animationTimeInMS) {
      aniTime = undefined.props.children.filter(function (x) {
        return x.key === goToPage;
      })[0].props.animationTimeInMS;
    } else {
      if (undefined.props.animationTimeInMS) aniTime = undefined.props.animationTimeInMS;
    }

    options = options === undefined ? [] : options;

    var _options = options,
        _options$props = _options.props,
        props = _options$props === undefined ? null : _options$props,
        _options$animationIn = _options.animationIn,
        animationIn = _options$animationIn === undefined ? undefined.componentTransitionIn[goToPage] ? undefined.componentTransitionIn[goToPage] : null : _options$animationIn,
        _options$timeAnimatio = _options.timeAnimationInMS,
        timeAnimationInMS = _options$timeAnimatio === undefined ? aniTime : _options$timeAnimatio,
        _options$animationOut = _options.animationOut,
        animationOut = _options$animationOut === undefined ? undefined.swipeRight ? "slideOutRight" : undefined.componentTransitionOut[fromPage] ? undefined.componentTransitionOut[fromPage] : null : _options$animationOut,
        _options$callbackFun = _options.callbackFun,
        callbackFun = _options$callbackFun === undefined ? null : _options$callbackFun;


    if (props !== null) {
      // let oldProps = this.state.props;
      var newProps = [];
      newProps[goToPage] = props;
      undefined.setState({ props: newProps });
    } else {}

    if (!undefined.busy) {
      // const fthis = this;

      //--animation time defult
      var timeAnimation = timeAnimationInMS; //param.timeAnimationInMS !== undefined && param.timeAnimationInMS !== null ? param.timeAnimationInMS :
      //     250; //ms

      if (goToPage !== fromPage) {
        //---ניהול חזרות----//
        undefined.busy = true;

        ///שמור היסטוריה
        var new_historyPages = undefined.state.historyPages.slice();

        if (undefined.listLevelPages[goToPage] <= undefined.listLevelPages[fromPage]) {
          //חוזרים אחורה, מחק את כל הדפים שהרמה שלהם גבוהה משלי.
          //new_historyPages.splice(new_historyPages.length - 1, 1);
          new_historyPages = new_historyPages.filter(function (x) {
            return undefined.listLevelPages[x] < undefined.listLevelPages[goToPage];
          });
        }
        new_historyPages.push(goToPage);
        //שמירת שינויים בהיסטוריה
        undefined.setState({ historyPages: new_historyPages });

        if (undefined.state.changeRoute) {
          window.location.href = window.location.href.substr(0, window.location.href.lastIndexOf("/") + 1) + "#" + (goToPage !== undefined.state.homePageKey ? goToPage : "");
        }

        //----navigator and animation----///

        if (undefined.listLevelPages[goToPage] > undefined.listLevelPages[fromPage]) {
          //--נכנסים דף פנימה Up--//
          undefined.funAnimationIn1(goToPage, fromPage);

          if (undefined.listLevelPages[goToPage] === 1) {
            //Up from level 0 to level 1
            console.log("goToPage: ", goToPage);
            // debugger
            $("#" + goToPage).css("animation", (animationIn !== null && animationIn !== undefined ? animationIn : "slideInRight") + " " + timeAnimation + "ms");
          } else {
            //else if (this.listLevelPages[goToPage] === 2) {
            //Up from level 1 to level 2
            $("#" + goToPage).css("animation", (animationIn !== null && animationIn !== undefined ? animationIn : "zoomIn") + " " + timeAnimation + "ms");
          }
        } else {
          //--חזרה בדפים Down--//
          undefined.funAnimationOut1(goToPage, fromPage);
          if (undefined.listLevelPages[fromPage] === 1) {
            //Down from level 1 to level 0
            $("#" + fromPage).css("animation", (animationOut !== null && animationOut !== undefined ? animationOut : "slideOutRight") + " " + timeAnimation + "ms");
          } else {
            //else if (this.listLevelPages[goToPage] === 1) {
            //Down from level 2 to level 1
            $("#" + fromPage).css("animation", (animationOut !== null && animationOut !== undefined ? animationOut : "zoomOut") + " " + timeAnimation + "ms");
          }
        }
        // //עיצוב כפתור חזרה
        // if (goToPage === "home") {
        //     $('#navigatorBack').css('display', "none");
        // } else {
        //     $('#navigatorBack').css('display', "flex");
        // }

        if (callbackFun !== undefined && callbackFun !== null) callbackFun();
      }
    }
  } catch (error) {
    console.error(error);
    debugger;
    return;
    fthis.onError(error);
  }
};

exports.default = changePage;