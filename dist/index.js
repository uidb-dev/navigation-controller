"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _jquery = require("./jquery-3.3.1.min");

var _jquery2 = _interopRequireDefault(_jquery);

require("./styles.css");

require("./animate.css");

var _proptypes = require("./proptypes");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// import { setTimeout } from "timers";

var Navigator = function (_React$Component) {
  _inherits(Navigator, _React$Component);

  function Navigator(props) {
    _classCallCheck(this, Navigator);

    var _this = _possibleConstructorReturn(this, (Navigator.__proto__ || Object.getPrototypeOf(Navigator)).call(this, props));

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

    var homePage = _this.props.homePageKey ? _this.props.homePageKey : Array.isArray(_this.props.children) ? _this.props.children.filter(function (child) {
      return (typeof child === "undefined" ? "undefined" : _typeof(child)) === "object" && !child.props.kill;
    })[0].key : _this.props.children.key;

    var changeRoute = true; //default
    if (mobileMode) changeRoute = false;else if (_this.props.changeRoute !== undefined) changeRoute = _this.props.changeRoute;

    if (!changeRoute) {
      startPage = homePage;
    } else {
      startPage = window.location.href.substr(window.location.href.lastIndexOf("/")) === "/" || window.location.href.substr(window.location.href.lastIndexOf("/")) === "/#" || window.location.href.substr(window.location.href.lastIndexOf("/")) === "/index.html" ? homePage : window.location.href.substr(window.location.href.lastIndexOf("/")).includes("/#") ? window.location.href.substr(window.location.href.lastIndexOf("/") + 2) : window.location.href.substr(window.location.href.lastIndexOf("/") + 1);
    }
    if (props.routeKey && !mobileMode) {
      startPage = props.routeKey;
    }

    _this.touchBackPage = "";

    _this.callbackFunOnChangePage = function () {};

    var fthis = _this;
    _this.onError = function (e) {
      console.error("navigator error");

      console.error(e);

      if (fthis.props.onError) _this.props.onError(e);
    };

    if (startPage && _this.props.children.filter(function (x) {
      return x.key === startPage;
    }).length === 0) {
      if (_this.props.errorPageKey && _this.props.children.filter(function (x) {
        return x.key === _this.props.errorPageKey;
      }).length !== 0) {
        startPage = _this.props.errorPageKey;
      } else startPage = homePage;
      console.error("startPage ", startPage, " undefined");
      _this.onError("page undefined");
    }

    var historyPages = [];
    historyPages.push(homePage);
    if (startPage !== homePage) historyPages.push(startPage);

    _this.state = {
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

    _this.swipeRight = false;
    // this.myComponentApp = this.props.myComponentApp;

    _this.historyPages = _this.state.historyPages;

    _this.listLevelPages = [];

    _this.componentTransitionIn = [];
    _this.componentTransitionOut = [];

    var listLevelPages = _this.listLevelPages;

    if (Array.isArray(_this.props.children)) {
      _this.props.children.filter(function (child) {
        return (typeof child === "undefined" ? "undefined" : _typeof(child)) === "object" && !child.props.kill;
      }).forEach(function (child) {
        listLevelPages[child.key] = child.props.levelPage === undefined ? child.key === homePage ? 0 : 99999 : child.props.levelPage;

        if (child.props.transitionIn) _this.componentTransitionIn[child.key] = child.props.transitionIn;
        if (child.props.transitionOut) _this.componentTransitionOut[child.key] = child.props.transitionOut;
      });
    } else {
      listLevelPages[_this.props.children.key] = _this.props.children.props.levelPage === undefined ? _this.props.children.key === homePage ? 0 : 99 : _this.props.children.props.levelPage;

      if (children.props.transitionIn) _this.componentTransitionIn[children.key] = children.props.transitionIn;
      if (children.props.transitionOut) _this.componentTransitionOut[children.key] = children.props.transitionOut;
    }

    // const childrenWithProps = React.Children.map(this.props.children, child =>
    //   React.cloneElement(child, { doSomething: this.doSomething })
    // );
    // this.props.nowPage(this.historyPages[this.historyPages.length - 1]);

    _this.busy = false;

    if (_this.props.onRef) _this.props.onRef(_this);

    _this.changePage = _this.changePage.bind(_this);
    _this.back = _this.back.bind(_this);
    _this.compareTwoPagesLavel = _this.compareTwoPagesLavel.bind(_this);

    if (Array.isArray(_this.props.children)) _this.props.children.map(function (child) {
      if (child.key === null || child.key === "") window.console.error("navigation_controller: key value it's required");
    });
    return _this;
  }

  _createClass(Navigator, [{
    key: "componentDidMount",
    value: function componentDidMount() {

      if (this.props.onChangePage !== undefined) this.props.onChangePage(this.state.historyPages[this.state.historyPages.length - 1], "In");
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {
      // if (!this.state.mobileMode)
      if (this.props.routeKey !== prevProps.routeKey) {
        this.changePage(this.props.routeKey ? this.props.routeKey : this.state.homePageKey);
      }
    }
    //----navigator and animation----///


  }, {
    key: "compareTwoPagesLavel",
    value: function compareTwoPagesLavel(goToPage, fromPage) {
      var fthis = this;
      try {
        if (this.listLevelPages[goToPage] < this.listLevelPages[fromPage]) return "Out";
        if (this.listLevelPages[goToPage] > this.listLevelPages[fromPage]) return "In";
        return "SameLevel";
      } catch (error) {
        fthis.onError(error);
      }
    }
  }, {
    key: "changePage",
    value: function changePage(goToPage, options) {
      var fthis = this;
      try {
        // if (goToPage === "#/") goToPage = undefined;

        if (goToPage && this.props.children.filter(function (x) {
          return x.key === goToPage;
        }).length === 0) {
          if (fthis.props.errorPageKey) {
            goToPage = fthis.props.errorPageKey;
          } else {
            goToPage = this.state.homePageKey;
          }
          console.error("goToPage ", goToPage, " undefined");
          fthis.onError("page undefined");
        }

        //close the app
        if (this.state.historyPages.length === 1 && goToPage === undefined) {
          console.log('"window.navigator.app.exitApp()"');

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

        var fromPage = "" + this.historyPages[this.historyPages.length - 1] + "";

        var aniTime = 250;

        if (this.props.children.filter(function (x) {
          return x.key === goToPage;
        })[0].props.animationTimeInMS) {
          aniTime = this.props.children.filter(function (x) {
            return x.key === goToPage;
          })[0].props.animationTimeInMS;
        } else {
          if (this.props.animationTimeInMS) aniTime = this.props.animationTimeInMS;
        }

        var renewHistory = function renewHistory(_ref) {
          var fthis = _ref.fthis,
              goToPage = _ref.goToPage,
              fromPage = _ref.fromPage;

          ///save to history
          var new_historyPages = fthis.state.historyPages.slice();

          fthis.props.children.filter(function (child) {
            return (typeof child === "undefined" ? "undefined" : _typeof(child)) === "object";
          }).forEach(function (child) {
            if (child.props.kill) {
              new_historyPages = fthis.state.historyPages.filter(function (x) {
                return x !== child.key && x !== goToPage;
              });
            }
          });

          if (fthis.listLevelPages[goToPage] <= fthis.listLevelPages[fromPage]) {
            //חוזרים אחורה, מחק את כל הדפים שהרמה שלהם גבוהה משלי.
            //new_historyPages.splice(new_historyPages.length - 1, 1);
            new_historyPages = new_historyPages.filter(function (x) {
              return fthis.listLevelPages[x] < fthis.listLevelPages[goToPage];
            });
          }
          new_historyPages.push(goToPage);
          //שמירת שינויים בהיסטוריה
          fthis.setState({ historyPages: new_historyPages });
        };

        options = options === undefined ? [] : options;

        var _options = options,
            _options$props = _options.props,
            props = _options$props === undefined ? null : _options$props,
            _options$animationIn = _options.animationIn,
            animationIn = _options$animationIn === undefined ? this.componentTransitionIn[goToPage] ? this.componentTransitionIn[goToPage] : null : _options$animationIn,
            _options$timeAnimatio = _options.timeAnimationInMS,
            timeAnimationInMS = _options$timeAnimatio === undefined ? aniTime : _options$timeAnimatio,
            _options$animationOut = _options.animationOut,
            animationOut = _options$animationOut === undefined ? this.swipeRight ? "slideOutRight" : this.componentTransitionOut[fromPage] ? this.componentTransitionOut[fromPage] : null : _options$animationOut,
            _options$callbackFun = _options.callbackFun,
            callbackFun = _options$callbackFun === undefined ? null : _options$callbackFun;


        if (props !== null) {
          // let oldProps = this.state.props;
          var newProps = [];
          newProps[goToPage] = props;
          this.setState({ props: newProps });
        } else {}

        if (!this.busy) {
          // const fthis = this;

          //--animation time defult
          var timeAnimation = timeAnimationInMS; //param.timeAnimationInMS !== undefined && param.timeAnimationInMS !== null ? param.timeAnimationInMS :
          //     250; //ms

          if (goToPage !== fromPage) {
            //---manger---//
            this.busy = true;

            if (this.state.changeRoute) {
              window.location.href = window.location.href.substr(0, window.location.href.lastIndexOf("/") + 1) + "#" + (goToPage !== this.state.homePageKey ? goToPage : "");
            }

            //----navigator and animation----///
            var isUp = null;
            if (this.listLevelPages[goToPage] > this.listLevelPages[fromPage]) {
              //--Go Up Lavel--//
              isUp = true;

              if (this.listLevelPages[goToPage] === 1) {
                //Up from level 0 to level 1
                // console.log("goToPage: ", goToPage);
                // debugger
                // $("#" + goToPage).css(
                //   "animation",
                //   (animationIn !== null && animationIn !== undefined
                //     ? animationIn
                //     : "slideInRight") +
                //   " " +
                //   timeAnimation +
                //   "ms"
                // );
              } else {
                  //else if (this.listLevelPages[goToPage] === 2) {
                  //Up from level 1 to level 2
                  // $("#" + goToPage).css(
                  //   "animation",
                  //   (animationIn !== null && animationIn !== undefined
                  //     ? animationIn
                  //     : "zoomIn") +
                  //   " " +
                  //   timeAnimation +
                  //   "ms"
                  // );
                }
            } else {
              //--Go Down Level--//
              isUp = false;
              if (this.listLevelPages[fromPage] === 1) {
                //Down from level 1 to level 0
                // $("#" + fromPage).css(
                //   "animation",
                //   (animationOut !== null && animationOut !== undefined
                //     ? animationOut
                //     : "slideOutRight") +
                //   " " +
                //   timeAnimation +
                //   "ms"
                // );
              } else {
                  //else if (this.listLevelPages[goToPage] === 1) {
                  //Down from level 2 to level 1
                  // $("#" + fromPage).css(
                  //   "animation",
                  //   (animationOut !== null && animationOut !== undefined
                  //     ? animationOut
                  //     : "zoomOut") +
                  //   " " +
                  //   timeAnimation +
                  //   "ms"
                  // );
                }
            }

            if (isUp) {
              renewHistory({ fthis: fthis, goToPage: goToPage, fromPage: fromPage });
            }

            // new version

            //  goToPage
            window.document.getElementById(goToPage).classList.add("show");
            // if (isUp) {
            //   window.document.getElementById(goToPage).style.animation = `up ${timeAnimation}ms`
            //   window.document.getElementById(goToPage).style.zIndex = 99;
            //   window.document.getElementById(fromPage).style.zIndex = -100;
            // }
            // else {
            //   window.document.getElementById(fromPage).style.animation = `down ${timeAnimation}ms`
            //   window.document.getElementById(goToPage).style.zIndex = 99;
            //   // window.document.getElementById(fromPage).style.zIndex = -100;
            // }
            if (isUp) {
              window.document.getElementById(goToPage).style.animation = "up-rtl " + timeAnimation + "ms";
              window.document.getElementById(goToPage).style.zIndex = 99;
              window.document.getElementById(fromPage).style.zIndex = -100;
            } else {
              window.document.getElementById(fromPage).style.animation = "down-rtl " + timeAnimation + "ms";
              window.document.getElementById(goToPage).style.zIndex = 99;
              // window.document.getElementById(fromPage).style.zIndex = -100;
            }

            setTimeout(function () {
              window.document.getElementById(fromPage).style.display = "";
              window.document.getElementById(fromPage).style.animation = '';
              window.document.getElementById(fromPage).classList.remove('show');

              renewHistory({ fthis: fthis, goToPage: goToPage, fromPage: fromPage });

              fthis.busy = false;
            }, timeAnimation + 3);

            if (callbackFun !== undefined && callbackFun !== null) callbackFun();
          }
        }
      } catch (error) {
        fthis.onError(error);
      }
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      var fthis = this;
      try {
        //--back button in android
        document.addEventListener("backbutton", function (e) {
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
    }
  }, {
    key: "back",
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(options) {
        var fthis, backToPage;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                fthis = this;
                backToPage = fthis.state.historyPages[fthis.state.historyPages.length - 2];

                if (!this.props.beforBack) {
                  _context.next = 7;
                  break;
                }

                _context.next = 5;
                return this.props.beforBack(backToPage);

              case 5:
                if (_context.sent) {
                  _context.next = 7;
                  break;
                }

                return _context.abrupt("return");

              case 7:
                if (!(this.props.routeKey && !options && backToPage !== undefined)) {
                  _context.next = 10;
                  break;
                }

                window.location.hash = "#/" + backToPage;
                return _context.abrupt("return");

              case 10:

                // console.log("navigator back with options: ", options);
                try {
                  fthis.props.children.forEach(function (child) {
                    if (child.props.kill) {
                      fthis.historyPages = fthis.historyPages.filter(function (x) {
                        return x !== child.key;
                      });
                    }
                  });
                  fthis.setState({ historyPages: fthis.historyPages });

                  //---
                  if (options === null || options === undefined) {
                    console.log("back=> changePage to: ", backToPage);

                    fthis.changePage(backToPage);
                  } else {
                    fthis.changePage(backToPage, options);
                  }
                } catch (error) {
                  fthis.onError(error);
                }

              case 11:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function back(_x) {
        return _ref2.apply(this, arguments);
      }

      return back;
    }()
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

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

      return Array.isArray(this.props.children) ? this.props.children.filter(function (child) {
        return (typeof child === "undefined" ? "undefined" : _typeof(child)) === "object" && !child.props.kill;
      }).map(function (child) {
        return _react2.default.createElement(
          "div",
          {
            // onTouchStart={(e) => {

            // }}

            onTouchMove: function onTouchMove(e) {
              if (child.props.backOnSwipeRight && !fthis.swipeRight) {
                if (e.touches[0].clientX < 0.2 * innerWidth) {
                  fthis.touchBackPage = nowPage;
                  fthis.swipeRight = true;
                  fthis.setState({
                    swipeRightStart_x: e.touches[0].clientX
                  });

                  var goToPage = _this2.state.historyPages[_this2.state.historyPages.length - 2];

                  (0, _jquery2.default)("#" + goToPage).css("z-index", 0);
                  (0, _jquery2.default)("#" + nowPage).css("z-index", 89);
                  (0, _jquery2.default)("#" + goToPage).removeClass("hiddenPage");
                  (0, _jquery2.default)("#" + goToPage).addClass("showPage overflow_Y_hidden");
                }
              }
              if (fthis.swipeRight) {
                fthis.setState({
                  swipeRight_x: e.touches[0].clientX - fthis.state.swipeRightStart_x <= 0 ? 1 : e.touches[0].clientX - fthis.state.swipeRightStart_x
                });
              }
            },
            onTouchEnd: function onTouchEnd(e) {
              var goToPage = _this2.state.historyPages[_this2.state.historyPages.length - 2];

              if (fthis.swipeRight && fthis.state.swipeRight_x > 0.25 * innerWidth) {
                fthis.callbackFunOnChangePage = function () {
                  (0, _jquery2.default)("#" + fthis.touchBackPage).css("left", "");
                  (0, _jquery2.default)("#" + goToPage).removeClass("overflow_Y_hidden");
                  fthis.setState({ swipeRight_x: 0 });
                  fthis.swipeRight = false;
                  fthis.touchBackPage = "";
                  fthis.callbackFunOnChangePage = function () {};
                };

                // fthis.touchBackPage = nowPage;
                fthis.back();
              } else {
                (0, _jquery2.default)("#" + nowPage).css("left", "");
                (0, _jquery2.default)("#" + goToPage).css("z-index", "");
                (0, _jquery2.default)("#" + nowPage).css("z-index", "");
                (0, _jquery2.default)("#" + goToPage).removeClass("showPage");
                (0, _jquery2.default)("#" + goToPage).addClass("hiddenPage");
                fthis.setState({ swipeRight_x: 0 });
                fthis.swipeRight = false;
                fthis.touchBackPage = "";
              }

              // }
            },
            style: {
              display: fthis.state.startPage === child.key ? "grid" : "",
              zIndex: fthis.state.startPage === child.key ? "99" : "",
              left: fthis.swipeRight ? fthis.touchBackPage === child.key ? fthis.state.swipeRight_x : "" : "",
              backgroundColor: child.props.backgroundColor ? child.props.backgroundColor : "#fff",
              height: child.props.height ? child.props.height : fthis.props.height ? _this2.props.height : "100%"
            },
            id: child.key,
            key: child.key,
            className: fthis.state.startPage === child.key ? child.props && child.props.className ? "page " + child.props.className : "page" : child.props.className ? "page " + child.props.className : "page"
          },
          nowPage === child.key || fthis.state.historyPages.includes(child.key) || child.props.alwaysLive ? _react2.default.cloneElement(child, fthis.state.props[child.key], child.props.children) : null
        );
      }) : _react2.default.createElement(
        "div",
        {
          style: {
            display: fthis.state.startPage === child.key ? "grid" : "",
            backgroundColor: this.props.children.props.backgroundColor ? this.props.children.props.backgroundColor : "#fff",
            height: this.props.children.props.height ? this.props.children.props : fthis.props.height ? this.props.height : "100%"
          },
          id: this.props.children.key,
          key: this.props.children.key,
          className: fthis.state.startPage === child.key ? this.props.children.props && this.props.children.props.className ? "page " + this.props.children.props.className : "page" : this.props.children.props && this.props.children.props.className ? " page " + this.props.children.props.className : "page"
        },
        nowPage === this.props.children.key || fthis.state.historyPages.includes(this.props.children.key) || this.props.children.props.alwaysLive ? _react2.default.cloneElement(this.props.children, fthis.state.props[this.props.children.key], this.props.children.props.children) // this.props.children
        : _react2.default.createElement("div", null)
      );
    }
  }]);

  return Navigator;
}(_react2.default.Component);

(0, _proptypes.addNavigatorPropTypes)(Navigator);

exports.default = Navigator;