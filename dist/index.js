'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _jquery = require('./jquery-3.3.1.min');

var _jquery2 = _interopRequireDefault(_jquery);

require('./styles.css');

require('./animate.css');

var _timers = require('timers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Navigator = function (_React$Component) {
    _inherits(Navigator, _React$Component);

    function Navigator(props) {
        _classCallCheck(this, Navigator);

        var _this = _possibleConstructorReturn(this, (Navigator.__proto__ || Object.getPrototypeOf(Navigator)).call(this, props));

        var startPage = "";
        var mobileMode = false;
        if (window.cordova) {
            if (window.cordova.platformId !== "browser") mobileMode = true;
        }

        var homePage = _this.props.homePageKey ? _this.props.homePageKey : Array.isArray(_this.props.children) ? _this.props.children[0].key : _this.props.children.key;

        if (mobileMode) {
            startPage = homePage;
        } else {

            startPage = window.location.href.substr(window.location.href.lastIndexOf("/")) === "/" || window.location.href.substr(window.location.href.lastIndexOf("/")) === "/#" ? homePage : window.location.href.substr(window.location.href.lastIndexOf("/") + 2);
        }
        _this.touchBackPage = "";

        _this.callbackFunOnChangePage = function () {};

        var historyPages = [];
        historyPages.push(homePage);
        if (startPage !== homePage) historyPages.push(startPage);

        _this.state = {
            historyPages: historyPages,
            nowPage: startPage,
            homePageKey: homePage,
            height: _this.props.height === null ? "100%" : _this.props.height,
            startPage: startPage,
            mobileMode: mobileMode,
            swipeRight_x: 0,
            props: []
            // this.myComponentApp = this.props.myComponentApp;

        };_this.historyPages = _this.state.historyPages;

        _this.listLevelPages = [];

        var listLevelPages = _this.listLevelPages;

        Array.isArray(_this.props.children) ? _this.props.children.forEach(function (child) {
            listLevelPages[child.key] = child.props.levelPage === undefined ? child.key === homePage ? 0 : 99 : child.props.levelPage;
        }) : listLevelPages[_this.props.children.key] = _this.props.children.props.levelPage === undefined ? _this.props.children.key === homePage ? 0 : 99 : _this.props.children.props.levelPage;

        // const childrenWithProps = React.Children.map(this.props.children, child =>
        //   React.cloneElement(child, { doSomething: this.doSomething })
        // );
        // this.props.nowPage(this.historyPages[this.historyPages.length - 1]);

        _this.busy = false;

        _this.props.onRef(_this);

        _this.changePage = _this.changePage.bind(_this);

        if (Array.isArray(_this.props.children)) _this.props.children.map(function (child) {
            if (child.key === null || child.key === "") window.console.log("react.cordova-navigation_controller: key value it's required");
        });

        return _this;
    }

    _createClass(Navigator, [{
        key: 'componentDidMount',
        value: function componentDidMount() {
            if (this.props.onChangePage !== undefined) this.props.onChangePage(this.state.historyPages[this.state.historyPages.length - 1], "In");
        }
        //----navigator and animation----///

    }, {
        key: 'funAnimationIn1',
        value: function funAnimationIn1(goToPage, fromPage) {
            var fthis = this;

            if (this.props.beforChangePage !== undefined) this.props.beforChangePage(goToPage, this.compareTwoPagesLavel(goToPage, fromPage));

            //--נכנסים דף פנימה Up--//
            var callbackFun = function callbackFun() {
                fthis.funAnimationIn2(goToPage, fromPage);
                document.getElementById(goToPage).removeEventListener("webkitAnimationEnd", callbackFun);
            };

            document.getElementById(goToPage).addEventListener("webkitAnimationEnd", callbackFun, false);

            this.busy = true;
            (0, _jquery2.default)('#' + goToPage).removeClass('hiddenPage');
            (0, _jquery2.default)('#' + goToPage).addClass('scrollPage showPage');
            (0, _jquery2.default)('#' + fromPage).css('z-index', 0);
            (0, _jquery2.default)('#' + goToPage).css('z-index', 89);
        }
    }, {
        key: 'funAnimationIn2',
        value: function funAnimationIn2(goToPage, fromPage) {
            (0, _jquery2.default)('#' + fromPage).css('z-index', "");
            (0, _jquery2.default)('#' + goToPage).css('z-index', "");
            (0, _jquery2.default)('#' + goToPage).css('animation', '');
            (0, _jquery2.default)('#' + fromPage).removeClass('showPage');
            (0, _jquery2.default)('#' + fromPage).removeClass('scrollPage');
            (0, _jquery2.default)('#' + fromPage).addClass('hiddenPage');
            this.busy = false;
            this.setState({ nowPage: goToPage });

            if (this.props.onChangePage !== undefined) this.props.onChangePage(this.state.historyPages[this.state.historyPages.length - 1], this.compareTwoPagesLavel(goToPage, fromPage));
        }
    }, {
        key: 'funAnimationOut1',
        value: function funAnimationOut1(goToPage, fromPage) {
            var _this2 = this;

            //--חזרה בדפים Down--//  

            if (this.props.beforChangePage !== undefined) this.props.beforChangePage(goToPage, this.compareTwoPagesLavel(goToPage, fromPage));

            var callbackFun = function callbackFun() {
                _this2.funAnimationOut2(goToPage, fromPage);
                document.getElementById(fromPage).removeEventListener("webkitAnimationEnd", callbackFun);
            };
            document.getElementById(fromPage).addEventListener("webkitAnimationEnd", callbackFun);
            this.busy = true;
            (0, _jquery2.default)('#' + goToPage).css('z-index', 0);
            (0, _jquery2.default)('#' + fromPage).css('z-index', 89);
            (0, _jquery2.default)('#' + goToPage).removeClass('hiddenPage');
            (0, _jquery2.default)('#' + goToPage).addClass('scrollPage showPage');
        }
    }, {
        key: 'funAnimationOut2',
        value: function funAnimationOut2(goToPage, fromPage) {
            (0, _jquery2.default)('#' + fromPage).css('animation', '');
            (0, _jquery2.default)('#' + goToPage).css('z-index', "");
            (0, _jquery2.default)('#' + goToPage).css('left', "");
            (0, _jquery2.default)('#' + fromPage).css('z-index', "");
            (0, _jquery2.default)('#' + fromPage).removeClass('showPage');
            (0, _jquery2.default)('#' + fromPage).removeClass('scrollPage');
            (0, _jquery2.default)('#' + fromPage).addClass('hiddenPage');
            this.busy = false;
            this.setState({ nowPage: goToPage });

            if (this.props.onChangePage !== undefined) this.props.onChangePage(this.state.historyPages[this.state.historyPages.length - 1], this.compareTwoPagesLavel(goToPage, fromPage));

            this.callbackFunOnChangePage();
        }
    }, {
        key: 'compareTwoPagesLavel',
        value: function compareTwoPagesLavel(goToPage, fromPage) {
            if (this.listLevelPages[goToPage] < this.listLevelPages[fromPage]) return "Out";
            if (this.listLevelPages[goToPage] > this.listLevelPages[fromPage]) return "In";
            return "SameLevel";
        }
    }, {
        key: 'changePage',
        value: function changePage(goToPage, options) {
            var _this3 = this;

            options = options === undefined ? [] : options;

            var _options = options,
                _options$props = _options.props,
                props = _options$props === undefined ? null : _options$props,
                _options$animationIn = _options.animationIn,
                animationIn = _options$animationIn === undefined ? null : _options$animationIn,
                _options$timeAnimatio = _options.timeAnimationInMS,
                timeAnimationInMS = _options$timeAnimatio === undefined ? 250 : _options$timeAnimatio,
                _options$animationOut = _options.animationOut,
                animationOut = _options$animationOut === undefined ? null : _options$animationOut,
                _options$callbackFun = _options.callbackFun,
                callbackFun = _options$callbackFun === undefined ? null : _options$callbackFun;


            if (props !== null) {
                // let oldProps = this.state.props;
                var newProps = [];
                newProps[goToPage] = props;
                this.setState({ props: newProps });
            } else {}

            if (!this.busy) {
                var fthis = this;

                var fromPage = "" + this.historyPages[this.historyPages.length - 1] + "";

                //--animation time defult
                var timeAnimation = timeAnimationInMS; //param.timeAnimationInMS !== undefined && param.timeAnimationInMS !== null ? param.timeAnimationInMS :
                //     250; //ms

                if (goToPage !== fromPage) {
                    //---ניהול חזרות----//
                    this.busy = true;
                    //סיום האפליקציה, סגור
                    if (this.state.historyPages.length === 1 && goToPage === undefined) {
                        console.log('"window.navigator.app.exitApp()"');
                        // fthis.showSwalLater ?
                        //     fthis.myChildrens.swal.runSwal(true) :
                        window.navigator.app.exitApp();
                    } else {
                        ///שמור היסטוריה
                        var new_historyPages = this.state.historyPages.slice();

                        if (this.listLevelPages[goToPage] <= this.listLevelPages[fromPage]) {
                            //חוזרים אחורה, מחק את כל הדפים שהרמה שלהם גבוהה משלי.
                            //new_historyPages.splice(new_historyPages.length - 1, 1);
                            new_historyPages = new_historyPages.filter(function (x) {
                                return _this3.listLevelPages[x] < _this3.listLevelPages[goToPage];
                            });
                        }
                        new_historyPages.push(goToPage);
                        //שמירת שינויים בהיסטוריה
                        this.setState({ historyPages: new_historyPages });
                    }

                    if (!window.cordova) window.location.href = window.location.href.substr(0, window.location.href.lastIndexOf("/") + 1) + "#" + (goToPage !== this.state.homePageKey ? goToPage : "");else if (window.cordova.platformId === "browser") window.location.href = window.location.href.substr(0, window.location.href.lastIndexOf("/") + 1) + "#" + (goToPage !== this.state.homePageKey ? goToPage : "");

                    //----navigator and animation----///

                    if (this.listLevelPages[goToPage] > this.listLevelPages[fromPage]) {
                        //--נכנסים דף פנימה Up--//
                        this.funAnimationIn1(goToPage, fromPage);

                        if (this.listLevelPages[goToPage] === 1) {
                            //Up from level 0 to level 1
                            (0, _jquery2.default)('#' + goToPage).css('animation', (animationIn !== null && animationIn !== undefined ? animationIn : 'slideInRight') + " " + timeAnimation + 'ms');
                        } else {
                            //else if (this.listLevelPages[goToPage] === 2) {
                            //Up from level 1 to level 2
                            (0, _jquery2.default)('#' + goToPage).css('animation', (animationIn !== null && animationIn !== undefined ? animationIn : 'zoomIn') + " " + timeAnimation + 'ms');
                        }
                    } else {
                        //--חזרה בדפים Down--//   
                        this.funAnimationOut1(goToPage, fromPage);
                        if (this.listLevelPages[fromPage] === 1) {
                            //Down from level 1 to level 0
                            (0, _jquery2.default)('#' + fromPage).css('animation', (animationOut !== null && animationOut !== undefined ? animationOut : 'slideOutRight') + " " + timeAnimation + 'ms');
                        } else {
                            //else if (this.listLevelPages[goToPage] === 1) {
                            //Down from level 2 to level 1
                            (0, _jquery2.default)('#' + fromPage).css('animation', (animationOut !== null && animationOut !== undefined ? animationOut : 'zoomOut') + " " + timeAnimation + 'ms');
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
        }
    }, {
        key: 'componentWillMount',
        value: function componentWillMount() {
            var fthis = this;
            if (fthis.state.mobileMode) {

                // //---lock portrait
                // window.screen.orientation.lock('portrait');

                //--back button in android

                document.addEventListener("backbutton", function (e) {
                    fthis.back();
                }, false);
            } else {
                //--back on change browser url
                window.addEventListener("hashchange", function (e) {
                    fthis.changePage(window.location.href.substr(window.location.href.lastIndexOf("/") + 2) === "" ? fthis.state.homePageKey : window.location.href.substr(window.location.href.lastIndexOf("/") + 2));
                });
            }
        }
    }, {
        key: 'back',
        value: function back() {
            this.changePage(this.state.historyPages[this.state.historyPages.length - 2]);
        }
    }, {
        key: 'render',
        value: function render() {
            var _this4 = this;

            // debugger
            var fthis = this;
            // window.navigation_controller = this;
            var nowPage = this.state.historyPages[this.state.historyPages.length - 1];
            this.historyPages = this.state.historyPages;
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


            this.historyPages = this.state.historyPages.slice();
            return Array.isArray(this.props.children) ? this.props.children.map(function (child) {
                return _react2.default.createElement(
                    'div',
                    {
                        onTouchStart: function onTouchStart(e) {
                            if (child.props.backOnSwipeRight) {
                                if (e.touches[0].clientX < 40) {
                                    fthis.touchBackPage = nowPage;
                                    fthis.swipeRight = true;
                                    fthis.setState({ swipeRight_x: e.touches[0].clientX });

                                    var goToPage = _this4.state.historyPages[_this4.state.historyPages.length - 2];

                                    (0, _jquery2.default)('#' + goToPage).css('z-index', 0);
                                    (0, _jquery2.default)('#' + nowPage).css('z-index', 89);
                                    (0, _jquery2.default)('#' + goToPage).removeClass('hiddenPage');
                                    (0, _jquery2.default)('#' + goToPage).addClass('showPage overflow_Y_hidden');
                                }
                            }
                        },
                        onTouchMove: function onTouchMove(e) {
                            if (fthis.swipeRight) {
                                fthis.setState({ swipeRight_x: e.touches[0].clientX });
                            }
                        },
                        onTouchEnd: function onTouchEnd(e) {
                            var goToPage = _this4.state.historyPages[_this4.state.historyPages.length - 2];

                            if (fthis.swipeRight && fthis.state.swipeRight_x > 80) {

                                fthis.callbackFunOnChangePage = function () {
                                    (0, _jquery2.default)('#' + fthis.touchBackPage).css('left', "");
                                    (0, _jquery2.default)('#' + goToPage).removeClass('overflow_Y_hidden');
                                    fthis.setState({ swipeRight_x: 0 });
                                    fthis.swipeRight = false;
                                    fthis.touchBackPage = "";
                                    fthis.callbackFunOnChangePage = function () {};
                                };

                                // fthis.touchBackPage = nowPage;
                                fthis.back();
                            } else {
                                (0, _jquery2.default)('#' + nowPage).css('left', "");
                                (0, _jquery2.default)('#' + goToPage).css('z-index', "");
                                (0, _jquery2.default)('#' + nowPage).css('z-index', "");
                                (0, _jquery2.default)('#' + goToPage).removeClass('showPage');
                                (0, _jquery2.default)('#' + goToPage).addClass('hiddenPage');
                                fthis.setState({ swipeRight_x: 0 });
                                fthis.swipeRight = false;
                                fthis.touchBackPage = "";
                            }

                            // }
                        },
                        style: {
                            left: fthis.swipeRight ? fthis.touchBackPage === child.key ? fthis.state.swipeRight_x : "" : "",
                            backgroundColor: child.props.backgroundColor ? child.props.backgroundColor : "#fff",
                            height: child.props.height ? child.props.height : fthis.state.height
                        },
                        id: child.key, key: child.key, className: fthis.state.startPage === child.key ? "showPage scrollPage" : "hiddenPage" },
                    nowPage === child.key || fthis.state.historyPages.includes(child.key) || child.props.alwaysLive ? _react2.default.cloneElement(child, fthis.state.props[child.key], child.props.children) : _react2.default.createElement('div', null)
                );
            }) : _react2.default.createElement(
                'div',
                { style: {
                        backgroundColor: this.props.children.props.backgroundColor ? this.props.children.props.backgroundColor : "#fff",
                        height: this.props.children.props.height ? this.props.children.props : fthis.state.height
                    },
                    id: this.props.children.key, key: this.props.children.key, className: fthis.state.startPage === this.props.children.key ? "showPage scrollPage" : "hiddenPage" },
                nowPage === this.props.children.key || fthis.state.historyPages.includes(this.props.children.key) || this.props.children.props.alwaysLive ? _react2.default.cloneElement(this.props.children, fthis.state.props[this.props.children.key], this.props.children.props.children) // this.props.children
                : _react2.default.createElement('div', null)
            );
        }
    }]);

    return Navigator;
}(_react2.default.Component);

exports.default = Navigator;