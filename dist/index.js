"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
require("./styles.css");
require("./animate.css");
var _proptypes = require("./proptypes");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
// import { setTimeout } from "timers";

// --- minimal DOM helpers (replace the previously vendored jQuery build) ---
// They no-op when the element is missing, matching jQuery's empty-set
// behaviour, so the surrounding control flow is unchanged.
var byId = id => document.getElementById(id);
var setStyle = (id, prop, value) => {
  var node = byId(id);
  if (node) node.style[prop] = value;
};
var addClass = function (id) {
  var node = byId(id);
  for (var _len = arguments.length, names = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    names[_key - 1] = arguments[_key];
  }
  if (node) node.classList.add(...names);
};
var removeClass = function (id) {
  var node = byId(id);
  for (var _len2 = arguments.length, names = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    names[_key2 - 1] = arguments[_key2];
  }
  if (node) node.classList.remove(...names);
};

// `props.children` is a single element (not an array) when the consumer renders
// exactly one page. Normalise before array operations. NOTE: deliberately not
// React.Children.toArray -- that rewrites keys (".$myKey") and this library uses
// child keys verbatim as DOM element ids and history entries.
var asChildArray = children => Array.isArray(children) ? children : children == null ? [] : [children];

// animate.css v4 ships its animations as `animate__`-prefixed CLASS names while
// its @keyframes stay unprefixed. This library drives transitions through the
// `animation` style property, which needs the KEYFRAME name -- so a prefixed
// value (`animate__slideInRight`, the documented v4 naming) matches no keyframe,
// no animation runs, no animation-end event ever fires, `busy` latches true and
// the navigator freezes for good. Normalise every transition name we read.
var animationName = name => typeof name === "string" ? name.replace("animate__", "") : name;

// Transitions complete on an animation-end event. Older WebKit WebViews only
// fire the prefixed `webkitAnimationEnd`; Firefox only fires the unprefixed
// `animationend`. Listen for both, but run the handler EXACTLY ONCE: a browser
// that emits both would otherwise finish the same navigation twice and
// double-advance the history stack. Both listeners are detached on the first
// accepted event. Events bubbling up from animated content *inside* the page are
// ignored, so page content can never end the page transition early.
var onAnimationEndOnce = (id, handler) => {
  // Deliberately not null-guarded: a missing element must throw here, exactly as
  // the previous inline addEventListener did, so the caller reports via onError
  // instead of arming a transition that can never complete.
  var node = document.getElementById(id);
  var wrapped = event => {
    if (event && event.target !== node) return;
    node.removeEventListener("webkitAnimationEnd", wrapped);
    node.removeEventListener("animationend", wrapped);
    handler();
  };
  node.addEventListener("webkitAnimationEnd", wrapped, false);
  node.addEventListener("animationend", wrapped, false);
};
class Navigator extends _react.default.Component {
  constructor(props) {
    super(props);
    var startPage = "";

    // add PropsTypes to children
    // this.props.children.forEach((element) => addChildPropTypes(element));

    //
    // if (this.props.routerKey) this.props.routeKey = this.props.routerKey;

    // mobileMode
    var mobileMode = false;
    if (window.cordova) {
      if (window.cordova.platformId !== "browser") mobileMode = true;
    }
    if (props.mobileMode) mobileMode = props.mobileMode;
    var homePage = this.props.homePageKey ? this.props.homePageKey : Array.isArray(this.props.children) ? this.props.children.filter(child => typeof child === "object" && !child.props.kill)[0].key : this.props.children.key;
    var changeRoute = true; //default
    if (mobileMode) changeRoute = false;else if (this.props.changeRoute !== undefined) changeRoute = this.props.changeRoute;
    if (!changeRoute) {
      startPage = homePage;
    } else {
      startPage = window.location.href.substr(window.location.href.lastIndexOf("/")) === "/" || window.location.href.substr(window.location.href.lastIndexOf("/")) === "/#" || window.location.href.substr(window.location.href.lastIndexOf("/")) === "/index.html" ? homePage : window.location.href.substr(window.location.href.lastIndexOf("/")).includes("/#") ? window.location.href.substr(window.location.href.lastIndexOf("/") + 2) : window.location.href.substr(window.location.href.lastIndexOf("/") + 1);
    }
    if (props.routeKey && !mobileMode) {
      startPage = props.routeKey;
    }
    this.touchBackPage = "";
    this.callbackFunOnChangePage = () => {};
    var fthis = this;
    this.onError = e => {
      console.error("navigator error");
      console.error(e);
      if (fthis.props.onError) this.props.onError(e);
    };
    if (startPage && asChildArray(this.props.children).filter(x => x.key === startPage).length === 0) {
      if (this.props.errorPageKey && asChildArray(this.props.children).filter(x => x.key === this.props.errorPageKey).length !== 0) {
        startPage = this.props.errorPageKey;
      } else startPage = homePage;
      console.error("startPage ", startPage, " undefined");
      this.onError("page undefined");
    }
    var historyPages = [];
    historyPages.push(homePage);
    if (startPage !== homePage) historyPages.push(startPage);
    this.state = {
      changeRoute: changeRoute,
      historyPages: historyPages,
      nowPage: startPage,
      homePageKey: homePage,
      // height: this.props.height ? this.props.height : "100%",
      startPage: startPage,
      mobileMode: mobileMode,
      swipeRight_x: 0,
      swipeRightStart_x: 0,
      props: []
    };
    this.swipeRight = false;
    // this.myComponentApp = this.props.myComponentApp;

    this.historyPages = this.state.historyPages;
    this.listLevelPages = [];
    this.componentTransitionIn = [];
    this.componentTransitionOut = [];
    var listLevelPages = this.listLevelPages;
    if (Array.isArray(this.props.children)) {
      this.props.children.filter(child => typeof child === "object" && !child.props.kill).forEach(child => {
        listLevelPages[child.key] = child.props.levelPage === undefined ? child.key === homePage ? 0 : 99999 : child.props.levelPage;
        if (child.props.transitionIn) this.componentTransitionIn[child.key] = child.props.transitionIn.replace("animate__", "");
        if (child.props.transitionOut) this.componentTransitionOut[child.key] = child.props.transitionOut.replace("animate__", "");
      });
    } else {
      listLevelPages[this.props.children.key] = this.props.children.props.levelPage === undefined ? this.props.children.key === homePage ? 0 : 99 : this.props.children.props.levelPage;
      if (this.props.children.props.transitionIn) this.componentTransitionIn[this.props.children.key] = this.props.children.props.transitionIn.replace("animate__", "");
      if (this.props.children.props.transitionOut) this.componentTransitionOut[this.props.children.key] = this.props.children.props.transitionOut.replace("animate__", "");
    }

    // const childrenWithProps = React.Children.map(this.props.children, child =>
    //   React.cloneElement(child, { doSomething: this.doSomething })
    // );
    // this.props.nowPage(this.historyPages[this.historyPages.length - 1]);

    this.busy = false;
    if (this.props.onRef) this.props.onRef(this);
    this.changePage = this.changePage.bind(this);
    this.back = this.back.bind(this);
    this.funAnimationIn1 = this.funAnimationIn1.bind(this);
    this.funAnimationIn2 = this.funAnimationIn2.bind(this);
    this.funAnimationOut1 = this.funAnimationOut1.bind(this);
    this.funAnimationOut2 = this.funAnimationOut2.bind(this);
    this.compareTwoPagesLavel = this.compareTwoPagesLavel.bind(this);
    asChildArray(this.props.children).forEach(child => {
      if (child.key === null || child.key === "") window.console.error("navigation_controller: key value it's required");
    });
  }
  componentDidUpdate(prevProps) {
    // if (!this.state.mobileMode)
    if (this.props.routeKey !== prevProps.routeKey) {
      this.changePage(this.props.routeKey ? this.props.routeKey : this.state.homePageKey);
    }
  }
  //----navigator and animation----///
  funAnimationIn1(goToPage, fromPage) {
    // debugger;
    var fthis = this;
    return new Promise((resolve, reject) => {
      try {
        if (document.getElementById(goToPage) === null || document.getElementById(goToPage) === undefined) {
          console.error("goToPage not found: ", goToPage);
        }
        if (document.getElementById(fromPage) === null || document.getElementById(fromPage) === undefined) {
          console.error("fromPage not found: ", fromPage);
        }
        if (this.props.beforChangePage !== undefined) this.props.beforChangePage(goToPage, this.compareTwoPagesLavel(goToPage, fromPage));

        //--נכנסים דף פנימה Up--//
        onAnimationEndOnce(goToPage, () => {
          try {
            fthis.funAnimationIn2(goToPage, fromPage);
          } catch (error) {
            fthis.onError(error);
          }
        });
        this.busy = true;
        document.getElementById(fromPage).style.zIndex = 0;
        document.getElementById(goToPage).style.zIndex = 89;
        document.getElementById(goToPage).classList.remove("hiddenPage");
        document.getElementById(goToPage).classList.add("showPage");
        document.getElementById(goToPage).classList.add("scrollPage");
        resolve();
      } catch (error) {
        fthis.onError(error);
        reject(error);
      }
    });
  }
  funAnimationIn2(goToPage, fromPage) {
    var fthis = this;
    try {
      if (document.getElementById(goToPage) === null || document.getElementById(goToPage) === undefined) {
        console.error("goToPage not found: ", goToPage);
      }
      if (document.getElementById(fromPage) === null || document.getElementById(fromPage) === undefined) {
        console.error("fromPage not found: ", fromPage);
      }
      document.getElementById(fromPage).style.zIndex = "";
      document.getElementById(goToPage).style.zIndex = "";
      document.getElementById(goToPage).style.animation = "";
      removeClass(fromPage, "showPage");
      removeClass(fromPage, "scrollPage");
      addClass(fromPage, "hiddenPage");
      this.busy = false;
      this.setState({
        nowPage: goToPage
      });
      if (this.props.onChangePage !== undefined) this.props.onChangePage(fthis.state.historyPages[this.state.historyPages.length - 1], fthis.compareTwoPagesLavel(goToPage, fromPage));
    } catch (error) {
      fthis.onError(error);
    }
  }
  funAnimationOut1(goToPage, fromPage) {
    //--Back page: Down--//

    var fthis = this;
    try {
      if (document.getElementById(goToPage) === null || document.getElementById(goToPage) === undefined) {
        console.error("goToPage not found: ", goToPage);
      }
      if (document.getElementById(fromPage) === null || document.getElementById(fromPage) === undefined) {
        console.error("fromPage not found: ", fromPage);
        // return;
      }
      if (this.props.beforChangePage !== undefined) fthis.props.beforChangePage(goToPage, fthis.compareTwoPagesLavel(goToPage, fromPage));
      onAnimationEndOnce(fromPage, () => {
        try {
          fthis.funAnimationOut2(goToPage, fromPage);
        } catch (error) {
          fthis.onError(error);
        }
      });
      this.busy = true;
      setStyle(goToPage, "zIndex", 0);
      setStyle(fromPage, "zIndex", 89);
      removeClass(goToPage, "hiddenPage");
      addClass(goToPage, "scrollPage", "showPage");
    } catch (error) {
      fthis.onError(error);
    }
  }
  funAnimationOut2(goToPage, fromPage) {
    if (document.getElementById(goToPage) === null || document.getElementById(goToPage) === undefined) {
      console.error("goToPage not found: ", goToPage);
    }
    if (document.getElementById(fromPage) === null || document.getElementById(fromPage) === undefined) {
      console.error("fromPage not found: ", fromPage);
    }
    var fthis = this;
    try {
      setStyle(fromPage, "animation", "");
      setStyle(goToPage, "zIndex", "");
      setStyle(goToPage, "left", "");
      setStyle(fromPage, "zIndex", "");
      removeClass(fromPage, "showPage");
      removeClass(fromPage, "scrollPage");
      addClass(fromPage, "hiddenPage");
      this.busy = false;
      this.setState({
        nowPage: goToPage
      });
      if (this.props.onChangePage !== undefined) this.props.onChangePage(fthis.state.historyPages[this.state.historyPages.length - 1], fthis.compareTwoPagesLavel(goToPage, fromPage));
      this.callbackFunOnChangePage();
    } catch (error) {
      fthis.onError(error);
    }
  }
  compareTwoPagesLavel(goToPage, fromPage) {
    var fthis = this;
    try {
      if (this.listLevelPages[goToPage] < this.listLevelPages[fromPage]) return "Out";
      if (this.listLevelPages[goToPage] > this.listLevelPages[fromPage]) return "In";
      return "SameLevel";
    } catch (error) {
      fthis.onError(error);
    }
  }
  changePage(goToPage, options) {
    var fthis = this;
    try {
      // if (goToPage === "#/") goToPage = undefined;

      var childArray = asChildArray(this.props.children);
      if (goToPage && childArray.filter(x => x.key === goToPage).length === 0) {
        if (fthis.props.errorPageKey) {
          goToPage = fthis.props.errorPageKey;
        } else {
          goToPage = this.state.homePageKey;
        }
        console.error("goToPage ", goToPage, " undefined");
        fthis.onError("page undefined");
      }

      //סיום האפליקציה, סגור
      if (this.state.historyPages.length === 1 && goToPage === undefined) {
        // fthis.showSwalLater ?
        //     fthis.myChildrens.swal.runSwal(true) :
        if (this.props.beforExit) if (!this.props.beforExit()) return;
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
      var renewHistory = _ref => {
        var fthis = _ref.fthis,
          goToPage = _ref.goToPage,
          fromPage = _ref.fromPage;
        return new Promise((resolve, reject) => {
          ///save to history
          var new_historyPages = fthis.state.historyPages.slice();
          asChildArray(fthis.props.children).filter(child => typeof child === "object").forEach(child => {
            if (child.props.kill) {
              new_historyPages = fthis.state.historyPages.filter(x => x !== child.key && x !== goToPage);
            }
          });
          if (fthis.listLevelPages[goToPage] <= fthis.listLevelPages[fromPage]) {
            //חוזרים אחורה, מחק את כל הדפים שהרמה שלהם גבוהה משלי.
            //new_historyPages.splice(new_historyPages.length - 1, 1);
            new_historyPages = new_historyPages.filter(x => fthis.listLevelPages[x] < fthis.listLevelPages[goToPage]);
          }
          new_historyPages.push(goToPage);
          //שמירת שינויים בהיסטוריה
          fthis.setState({
            historyPages: new_historyPages
          }, () => {
            resolve("Success!");
          });
        });
      };
      var fromPage = "" + this.historyPages[this.historyPages.length - 1] + "";
      var aniTime = 250;
      if (childArray.filter(x => x.key === goToPage)[0].props.animationTimeInMS) {
        aniTime = childArray.filter(x => x.key === goToPage)[0].props.animationTimeInMS;
      } else {
        if (this.props.animationTimeInMS) aniTime = this.props.animationTimeInMS;
      }
      options = options === undefined ? [] : options;
      var _options = options,
        _options$props = _options.props,
        props = _options$props === void 0 ? null : _options$props,
        _options$animationIn = _options.animationIn,
        animationIn = _options$animationIn === void 0 ? this.componentTransitionIn[goToPage] ? this.componentTransitionIn[goToPage] : null : _options$animationIn,
        _options$timeAnimatio = _options.timeAnimationInMS,
        timeAnimationInMS = _options$timeAnimatio === void 0 ? aniTime : _options$timeAnimatio,
        _options$animationOut = _options.animationOut,
        animationOut = _options$animationOut === void 0 ? this.swipeRight ? "slideOutRight" : this.componentTransitionOut[fromPage] ? this.componentTransitionOut[fromPage] : null : _options$animationOut,
        _options$callbackFun = _options.callbackFun,
        callbackFun = _options$callbackFun === void 0 ? null : _options$callbackFun;

      // Caller-supplied animation names go through the same animate.css v4
      // normalisation as the child transitionIn/transitionOut props: an
      // `animate__`-prefixed name here would match no keyframe and latch `busy`.
      animationIn = animationName(animationIn);
      animationOut = animationName(animationOut);
      if (props !== null) {
        // let oldProps = this.state.props;
        var newProps = [];
        newProps[goToPage] = props;
        this.setState({
          props: newProps
        });
      } else {}
      if (!this.busy) {
        // const fthis = this;

        //--animation time defult
        var timeAnimation = timeAnimationInMS; //param.timeAnimationInMS !== undefined && param.timeAnimationInMS !== null ? param.timeAnimationInMS :
        //     250; //ms

        if (goToPage !== fromPage) {
          //---ניהול חזרות----//
          this.busy = true;
          if (this.state.changeRoute) {
            window.location.href = window.location.href.substr(0, window.location.href.lastIndexOf("/") + 1) + "#" + (goToPage !== this.state.homePageKey ? goToPage : "");
          }

          //----navigator and animation----///

          if (this.listLevelPages[goToPage] > this.listLevelPages[fromPage]) {
            //--Go Up Lavel--//
            renewHistory({
              fthis,
              goToPage,
              fromPage
            }).then(() => {
              setTimeout(() => {
                fthis.funAnimationIn1(goToPage, fromPage).then(() => {
                  // if (fthis.listLevelPages[goToPage] === 1) {
                  //Up from level 0 to level 1
                  // $("#" + goToPage).css(
                  //   "animation",
                  //   (animationIn !== null && animationIn !== undefined
                  //     ? animationIn
                  //     : "slideInRight") +
                  //     " " +
                  //     timeAnimation +
                  //     "ms"
                  // );
                  document.getElementById(goToPage).style.animation = (animationIn !== null && animationIn !== undefined ? animationIn : "slideInRight") + " " + timeAnimation + "ms";
                  // } else {
                  //   //else if (this.listLevelPages[goToPage] === 2) {
                  //   //Up from level 1 to level 2
                  //   $("#" + goToPage).css(
                  //     "animation",
                  //     (animationIn !== null && animationIn !== undefined
                  //       ? animationIn
                  //       : "zoomIn") +
                  //     " " +
                  //     timeAnimation +
                  //     "ms"
                  //   );
                  // }
                });
              }, 18);
            });
          } else {
            //--Go Down Level--//
            setTimeout(() => {
              renewHistory({
                fthis,
                goToPage,
                fromPage
              });
            }, timeAnimation);
            this.funAnimationOut1(goToPage, fromPage);
            // if (this.listLevelPages[fromPage] === 1) {
            //Down from level 1 to level 0
            setStyle(fromPage, "animation", (animationOut !== null && animationOut !== undefined ? animationOut : "slideOutRight") + " " + timeAnimation + "ms");
            // } else {
            //   //else if (this.listLevelPages[goToPage] === 1) {
            //   //Down from level 2 to level 1
            //   $("#" + fromPage).css(
            //     "animation",
            //     (animationOut !== null && animationOut !== undefined
            //       ? animationOut
            //       : "zoomOut") +
            //     " " +
            //     timeAnimation +
            //     "ms"
            //   );
            // }
          }
          if (callbackFun !== undefined && callbackFun !== null) callbackFun();
        }
      }
    } catch (error) {
      fthis.onError(error);
    }
  }
  componentDidMount() {
    var fthis = this;
    try {
      //--back button in android
      document.addEventListener("backbutton", e => {
        fthis.back();
      }, false);

      //--back on change browser url
      if (fthis.state.changeRoute) window.addEventListener("hashchange", function (e) {
        var pagePath = window.location.href.substr(window.location.href.lastIndexOf("/")).includes("/#") ? window.location.href.substr(window.location.href.lastIndexOf("/") + 2) : window.location.href.substr(window.location.href.lastIndexOf("/") + 1);
        fthis.changePage(pagePath === "" ? fthis.state.homePageKey : pagePath);
      });
    } catch (error) {
      fthis.onError(error);
    }

    //--announce the page the navigator started on. This used to live in a
    //  second componentDidMount that silently shadowed this one, so it never ran.
    //  Guarded exactly like every other onChangePage call site: a consumer
    //  handler that throws must be reported through onError, never propagate out
    //  of componentDidMount and tear down the whole React tree at startup.
    try {
      if (this.props.onChangePage !== undefined) this.props.onChangePage(this.state.historyPages[this.state.historyPages.length - 1], "In");
    } catch (error) {
      fthis.onError(error);
    }
  }
  back(options) {
    var _this = this;
    return _asyncToGenerator(function* () {
      var fthis = _this;
      var backToPage = fthis.state.historyPages[fthis.state.historyPages.length - 2];
      if (_this.props.beforBack) {
        if (!(yield _this.props.beforBack(backToPage))) return;
      }

      //
      // if (this.props.routeKey && !options && backToPage !== undefined) {
      //   // console.log(
      //   //   "this.props.routeKey && !options && backToPage !== undefined : ",
      //   //   this.props.routeKey && !options && backToPage !== undefined
      //   // );
      //   window.location.hash = "#/" + backToPage;
      //   return;
      // }

      try {
        asChildArray(fthis.props.children).forEach(child => {
          if (child.props.kill) {
            fthis.historyPages = fthis.historyPages.filter(x => x !== child.key);
          }
        });
        fthis.setState({
          historyPages: fthis.historyPages
        });

        //---
        if (options === null || options === undefined) {
          fthis.changePage(backToPage);
        } else {
          fthis.changePage(backToPage, options);
        }
      } catch (error) {
        fthis.onError(error);
      }
    })();
  }
  render() {
    var fthis = this;
    // window.navigation_controller = this;
    var nowPage = this.state.historyPages[this.state.historyPages.length - 1];
    this.historyPages = this.state.historyPages; //.slice();
    this.nowPage = this.state.nowPage;

    // if (Array.isArray(this.props.children)) {
    //     this.props.children.map(child => {
    //         if (fthis.state.props[child.key] !== undefined) {
    //             fthis.state.props[child.key].forEach((prop)=>{
    //                 this.props.children.filter((x)=>x.key===child.key)[0].props[prop]
    //             })
    //         }
    //     });
    // }

    return Array.isArray(this.props.children) ? this.props.children.filter(child => typeof child === "object" && !child.props.kill).map(child => {
      return /*#__PURE__*/_react.default.createElement("div", {
        // onTouchStart={(e) => {

        // }}

        onTouchMove: e => {
          if (child.props.backOnSwipeRight && !fthis.swipeRight) {
            if (e.touches[0].clientX < 0.2 * innerWidth) {
              fthis.touchBackPage = nowPage;
              fthis.swipeRight = true;
              fthis.setState({
                swipeRightStart_x: e.touches[0].clientX
              });
              var goToPage = this.state.historyPages[this.state.historyPages.length - 2];
              setStyle(goToPage, "zIndex", 0);
              setStyle(nowPage, "zIndex", 89);
              removeClass(goToPage, "hiddenPage");
              addClass(goToPage, "showPage", "overflow_Y_hidden");
            }
          }
          if (fthis.swipeRight) {
            fthis.setState({
              swipeRight_x: e.touches[0].clientX - fthis.state.swipeRightStart_x <= 0 ? 1 : e.touches[0].clientX - fthis.state.swipeRightStart_x
            });
          }
        },
        onTouchEnd: e => {
          var goToPage = this.state.historyPages[this.state.historyPages.length - 2];
          if (fthis.swipeRight && fthis.state.swipeRight_x > 0.25 * innerWidth) {
            fthis.callbackFunOnChangePage = () => {
              setStyle(fthis.touchBackPage, "left", "");
              removeClass(goToPage, "overflow_Y_hidden");
              fthis.setState({
                swipeRight_x: 0
              });
              fthis.swipeRight = false;
              fthis.touchBackPage = "";
              fthis.callbackFunOnChangePage = () => {};
            };

            // fthis.touchBackPage = nowPage;
            fthis.back();
          } else {
            setStyle(nowPage, "left", "");
            setStyle(goToPage, "zIndex", "");
            setStyle(nowPage, "zIndex", "");
            removeClass(goToPage, "showPage");
            addClass(goToPage, "hiddenPage");
            fthis.setState({
              swipeRight_x: 0
            });
            fthis.swipeRight = false;
            fthis.touchBackPage = "";
          }

          // }
        },
        style: {
          left: fthis.swipeRight ? fthis.touchBackPage === child.key ? fthis.state.swipeRight_x : "" : "",
          backgroundColor: child.props.backgroundColor ? child.props.backgroundColor : "#fff",
          height: child.props.height ? child.props.height : fthis.props.height ? this.props.height : "100%"
        },
        id: child.key,
        key: child.key,
        className: fthis.state.startPage === child.key ? child.props && child.props.className ? "showPage scrollPage " + child.props.className : "showPage scrollPage" : child.props.className ? "hiddenPage " + child.props.className : "hiddenPage"
      }, nowPage === child.key || fthis.state.historyPages.includes(child.key) || child.props.alwaysLive ? /*#__PURE__*/_react.default.cloneElement(child, fthis.state.props[child.key], child.props.children) : null);
    }) : /*#__PURE__*/_react.default.createElement("div", {
      style: {
        backgroundColor: this.props.children.props.backgroundColor ? this.props.children.props.backgroundColor : "#fff",
        height: this.props.children.props.height ? this.props.children.props.height : fthis.props.height ? this.props.height : "100%"
      },
      id: this.props.children.key,
      key: this.props.children.key,
      className: fthis.state.startPage === this.props.children.key ? this.props.children.props && this.props.children.props.className ? "showPage scrollPage " + this.props.children.props.className : "showPage scrollPage" : this.props.children.props && this.props.children.props.className ? "hiddenPage " + this.props.children.props.className : "hiddenPage"
    }, nowPage === this.props.children.key || fthis.state.historyPages.includes(this.props.children.key) || this.props.children.props.alwaysLive ? (/*#__PURE__*/_react.default.cloneElement(this.props.children, fthis.state.props[this.props.children.key], this.props.children.props.children) // this.props.children
    ) : /*#__PURE__*/_react.default.createElement("div", null));
  }
}
(0, _proptypes.addNavigatorPropTypes)(Navigator);
var _default = exports.default = Navigator;