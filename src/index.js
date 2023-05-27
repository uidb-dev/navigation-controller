import React from "react";
import $ from "./jquery-3.3.1.min";
import "./styles.css";
import "./animate.css";
import { addNavigatorPropTypes } from "./proptypes";
// import { setTimeout } from "timers";

class Navigator extends React.Component {
  constructor(props) {
    super(props);

    let startPage = "";

    // add PropsTypes to children
    // this.props.children.forEach((element) => addChildPropTypes(element));

    //
    // if (this.props.routerKey) this.props.routeKey = this.props.routerKey;

    // mobileMode
    let mobileMode = false;
    if (window.cordova) {
      if (window.cordova.platformId !== "browser") mobileMode = true;
    }
    if (props.mobileMode) mobileMode = props.mobileMode;

    const homePage = this.props.homePageKey
      ? this.props.homePageKey
      : Array.isArray(this.props.children)
        ? this.props.children.filter(
          (child) => typeof child === "object" && !child.props.kill
        )[0].key
        : this.props.children.key;

    let changeRoute = true; //default
    if (mobileMode) changeRoute = false;
    else if (this.props.changeRoute !== undefined)
      changeRoute = this.props.changeRoute;

    if (!changeRoute) {
      startPage = homePage;
    } else {
      startPage =
        window.location.href.substr(window.location.href.lastIndexOf("/")) ===
          "/" ||
          window.location.href.substr(window.location.href.lastIndexOf("/")) ===
          "/#" ||
          window.location.href.substr(window.location.href.lastIndexOf("/")) ===
          "/index.html"
          ? homePage
          : window.location.href
            .substr(window.location.href.lastIndexOf("/"))
            .includes("/#")
            ? window.location.href.substr(
              window.location.href.lastIndexOf("/") + 2
            )
            : window.location.href.substr(
              window.location.href.lastIndexOf("/") + 1
            );
    }
    if (props.routeKey && !mobileMode) {
      startPage = props.routeKey;
    }

    this.touchBackPage = "";

    this.callbackFunOnChangePage = () => { };

    const fthis = this;
    this.onError = (e) => {
      console.error("navigator error");

      console.error(e);

      if (fthis.props.onError) this.props.onError(e);
    };

    if (
      startPage &&
      this.props.children.filter((x) => x.key === startPage).length === 0
    ) {
      if (
        this.props.errorPageKey &&
        this.props.children.filter((x) => x.key === this.props.errorPageKey)
          .length !== 0
      ) {
        startPage = this.props.errorPageKey;
      } else startPage = homePage;
      console.error("startPage ", startPage, " undefined");
      this.onError("page undefined");
    }

    const historyPages = [];
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
      props: [],
    };

    this.swipeRight = false;
    // this.myComponentApp = this.props.myComponentApp;

    this.historyPages = this.state.historyPages;

    this.listLevelPages = [];

    this.componentTransitionIn = [];
    this.componentTransitionOut = [];

    let listLevelPages = this.listLevelPages;

    if (Array.isArray(this.props.children)) {
      this.props.children
        .filter((child) => typeof child === "object" && !child.props.kill)
        .forEach((child) => {
          listLevelPages[child.key] =
            child.props.levelPage === undefined
              ? child.key === homePage
                ? 0
                : 99999
              : child.props.levelPage;

          if (child.props.transitionIn)
            this.componentTransitionIn[child.key] = child.props.transitionIn;
          if (child.props.transitionOut)
            this.componentTransitionOut[child.key] = child.props.transitionOut;
        });
    } else {
      listLevelPages[this.props.children.key] =
        this.props.children.props.levelPage === undefined
          ? this.props.children.key === homePage
            ? 0
            : 99
          : this.props.children.props.levelPage;

      if (children.props.transitionIn)
        this.componentTransitionIn[children.key] = children.props.transitionIn;
      if (children.props.transitionOut)
        this.componentTransitionOut[children.key] =
          children.props.transitionOut;
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

    if (Array.isArray(this.props.children))
      this.props.children.map((child) => {
        if (child.key === null || child.key === "")
          window.console.error(
            "navigation_controller: key value it's required"
          );
      });
  }

  componentDidMount() {

    if (this.props.onChangePage !== undefined)
      this.props.onChangePage(
        this.state.historyPages[this.state.historyPages.length - 1],
        "In"
      );
  }
  componentDidUpdate(prevProps) {
    // if (!this.state.mobileMode)
    if (this.props.routeKey !== prevProps.routeKey) {
      this.changePage(
        this.props.routeKey ? this.props.routeKey : this.state.homePageKey
      );
    }
  }
  //----navigator and animation----///
  funAnimationIn1(goToPage, fromPage) {
    const fthis = this;

    try {
      if (
        document.getElementById(goToPage) === null ||
        document.getElementById(goToPage) === undefined
      ) {
        console.error("goToPage not found: ", goToPage);
      }
      if (
        document.getElementById(fromPage) === null ||
        document.getElementById(fromPage) === undefined
      ) {
        console.error("fromPage not found: ", fromPage);
      }

      if (this.props.beforChangePage !== undefined)
        this.props.beforChangePage(
          goToPage,
          this.compareTwoPagesLavel(goToPage, fromPage)
        );

      //--נכנסים דף פנימה Up--//
      let callbackFun = () => {
        try {
          fthis.funAnimationIn2(goToPage, fromPage);
          document
            .getElementById(goToPage)
            .removeEventListener("webkitAnimationEnd", callbackFun);
        } catch (error) {
          fthis.onError(error);
        }
      };

      document
        .getElementById(goToPage)
        .addEventListener("webkitAnimationEnd", callbackFun, false);

      this.busy = true;
      $("#" + goToPage).removeClass("hiddenPage");
      $("#" + goToPage).addClass("scrollPage showPage");
      $("#" + fromPage).css("z-index", 0);
      $("#" + goToPage).css("z-index", 89);
    } catch (error) {
      fthis.onError(error);
    }
  }

  funAnimationIn2(goToPage, fromPage) {
    const fthis = this;

    try {
      if (
        document.getElementById(goToPage) === null ||
        document.getElementById(goToPage) === undefined
      ) {
        console.error("goToPage not found: ", goToPage);
      }
      if (
        document.getElementById(fromPage) === null ||
        document.getElementById(fromPage) === undefined
      ) {
        console.error("fromPage not found: ", fromPage);
      }

      $("#" + fromPage).css("z-index", "");
      $("#" + goToPage).css("z-index", "");
      $("#" + goToPage).css("animation", "");
      $("#" + fromPage).removeClass("showPage");
      $("#" + fromPage).removeClass("scrollPage");
      $("#" + fromPage).addClass("hiddenPage");
      this.busy = false;
      this.setState({ nowPage: goToPage });

      if (this.props.onChangePage !== undefined)
        this.props.onChangePage(
          fthis.state.historyPages[this.state.historyPages.length - 1],
          fthis.compareTwoPagesLavel(goToPage, fromPage)
        );
    } catch (error) {
      fthis.onError(error);
    }
  }

  funAnimationOut1(goToPage, fromPage) {
    //--Back page: Down--//

    const fthis = this;

    try {
      if (
        document.getElementById(goToPage) === null ||
        document.getElementById(goToPage) === undefined
      ) {
        console.error("goToPage not found: ", goToPage);
      }
      if (
        document.getElementById(fromPage) === null ||
        document.getElementById(fromPage) === undefined
      ) {
        console.error("fromPage not found: ", fromPage);
        // return;
      }

      if (this.props.beforChangePage !== undefined)
        fthis.props.beforChangePage(
          goToPage,
          fthis.compareTwoPagesLavel(goToPage, fromPage)
        );

      let callbackFun = () => {
        try {
          fthis.funAnimationOut2(goToPage, fromPage);
          document
            .getElementById(fromPage)
            .removeEventListener("webkitAnimationEnd", callbackFun);
        } catch (error) {
          fthis.onError(error);
        }
      };
      document
        .getElementById(fromPage)
        .addEventListener("webkitAnimationEnd", callbackFun);
      this.busy = true;
      $("#" + goToPage).css("z-index", 0);
      $("#" + fromPage).css("z-index", 89);
      $("#" + goToPage).removeClass("hiddenPage");
      $("#" + goToPage).addClass("scrollPage showPage");
    } catch (error) {
      fthis.onError(error);
    }
  }
  funAnimationOut2(goToPage, fromPage) {
    if (
      document.getElementById(goToPage) === null ||
      document.getElementById(goToPage) === undefined
    ) {
      console.error("goToPage not found: ", goToPage);
    }
    if (
      document.getElementById(fromPage) === null ||
      document.getElementById(fromPage) === undefined
    ) {
      console.error("fromPage not found: ", fromPage);
    }

    const fthis = this;
    try {
      $("#" + fromPage).css("animation", "");
      $("#" + goToPage).css("z-index", "");
      $("#" + goToPage).css("left", "");
      $("#" + fromPage).css("z-index", "");
      $("#" + fromPage).removeClass("showPage");
      $("#" + fromPage).removeClass("scrollPage");
      $("#" + fromPage).addClass("hiddenPage");
      this.busy = false;
      this.setState({ nowPage: goToPage });

      if (this.props.onChangePage !== undefined)
        this.props.onChangePage(
          fthis.state.historyPages[this.state.historyPages.length - 1],
          fthis.compareTwoPagesLavel(goToPage, fromPage)
        );

      this.callbackFunOnChangePage();
    } catch (error) {
      fthis.onError(error);
    }
  }

  compareTwoPagesLavel(goToPage, fromPage) {
    const fthis = this;
    try {
      if (this.listLevelPages[goToPage] < this.listLevelPages[fromPage])
        return "Out";
      if (this.listLevelPages[goToPage] > this.listLevelPages[fromPage])
        return "In";
      return "SameLevel";
    } catch (error) {
      fthis.onError(error);
    }
  }

  changePage(goToPage, options) {
    const fthis = this;
    try {
      // if (goToPage === "#/") goToPage = undefined;

      if (
        goToPage &&
        this.props.children.filter((x) => x.key === goToPage).length === 0
      ) {
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
        console.log('"window.navigator.app.exitApp()"');
        // fthis.showSwalLater ?
        //     fthis.myChildrens.swal.runSwal(true) :
        if (this.props.beforExit) if (!this.props.beforExit()) return;
        window.navigator.app.exitApp();
        return;
      }

      if (goToPage === undefined) {
        console.error(
          "navigator error: changePage function need goToPage parameter."
        );
        return;
      }

      if (fthis.listLevelPages[goToPage] === undefined) {
        console.error(
          "navigator error, at changePage. goToPage parameter not found in the pages list."
        );
        return;
      }

      this.props.children
        .filter((child) => typeof child === "object")
        .forEach((child) => {
          if (child.props.kill) {
            fthis.historyPages = fthis.historyPages.filter(
              (x) => x !== child.key
            );
          }
        });

      this.setState({ historyPages: this.historyPages });

      const fromPage =
        "" + this.historyPages[this.historyPages.length - 1] + "";

      let aniTime = 250;

      if (
        this.props.children.filter((x) => x.key === goToPage)[0].props
          .animationTimeInMS
      ) {
        aniTime = this.props.children.filter((x) => x.key === goToPage)[0].props
          .animationTimeInMS;
      } else {
        if (this.props.animationTimeInMS)
          aniTime = this.props.animationTimeInMS;
      }

      options = options === undefined ? [] : options;

      const {
        props = null,
        animationIn = this.componentTransitionIn[goToPage]
          ? this.componentTransitionIn[goToPage]
          : null,
        timeAnimationInMS = aniTime,
        animationOut = this.swipeRight
          ? "slideOutRight"
          : this.componentTransitionOut[fromPage]
            ? this.componentTransitionOut[fromPage]
            : null,
        callbackFun = null,
      } = options;

      if (props !== null) {
        // let oldProps = this.state.props;
        let newProps = [];
        newProps[goToPage] = props;
        this.setState({ props: newProps });
      } else {
      }

      if (!this.busy) {
        // const fthis = this;

        //--animation time defult
        const timeAnimation = timeAnimationInMS; //param.timeAnimationInMS !== undefined && param.timeAnimationInMS !== null ? param.timeAnimationInMS :
        //     250; //ms

        if (goToPage !== fromPage) {
          //---ניהול חזרות----//
          this.busy = true;

          ///שמור היסטוריה
          let new_historyPages = this.state.historyPages.slice();

          if (this.listLevelPages[goToPage] <= this.listLevelPages[fromPage]) {
            //חוזרים אחורה, מחק את כל הדפים שהרמה שלהם גבוהה משלי.
            //new_historyPages.splice(new_historyPages.length - 1, 1);
            new_historyPages = new_historyPages.filter(
              (x) => this.listLevelPages[x] < this.listLevelPages[goToPage]
            );
          }
          new_historyPages.push(goToPage);
          //שמירת שינויים בהיסטוריה
          this.setState({ historyPages: new_historyPages });

          if (this.state.changeRoute) {
            window.location.href =
              window.location.href.substr(
                0,
                window.location.href.lastIndexOf("/") + 1
              ) +
              "#" +
              (goToPage !== this.state.homePageKey ? goToPage : "");
          }

          //----navigator and animation----///

          if (this.listLevelPages[goToPage] > this.listLevelPages[fromPage]) {
            //--Go Up Lavel--//
            this.funAnimationIn1(goToPage, fromPage);

            if (this.listLevelPages[goToPage] === 1) {
              //Up from level 0 to level 1
              console.log("goToPage: ", goToPage);
              // debugger
              $("#" + goToPage).css(
                "animation",
                (animationIn !== null && animationIn !== undefined
                  ? animationIn
                  : "slideInRight") +
                " " +
                timeAnimation +
                "ms"
              );
            } else {
              //else if (this.listLevelPages[goToPage] === 2) {
              //Up from level 1 to level 2
              $("#" + goToPage).css(
                "animation",
                (animationIn !== null && animationIn !== undefined
                  ? animationIn
                  : "zoomIn") +
                " " +
                timeAnimation +
                "ms"
              );
            }
          } else {
            //--Go Down Level--//
            this.funAnimationOut1(goToPage, fromPage);
            if (this.listLevelPages[fromPage] === 1) {
              //Down from level 1 to level 0
              $("#" + fromPage).css(
                "animation",
                (animationOut !== null && animationOut !== undefined
                  ? animationOut
                  : "slideOutRight") +
                " " +
                timeAnimation +
                "ms"
              );
            } else {
              //else if (this.listLevelPages[goToPage] === 1) {
              //Down from level 2 to level 1
              $("#" + fromPage).css(
                "animation",
                (animationOut !== null && animationOut !== undefined
                  ? animationOut
                  : "zoomOut") +
                " " +
                timeAnimation +
                "ms"
              );
            }
          }

          if (callbackFun !== undefined && callbackFun !== null) callbackFun();
        }
      }
    } catch (error) {
      fthis.onError(error);
    }
  }

  componentDidMount() {
    const fthis = this;
    try {
      //--back button in android
      document.addEventListener(
        "backbutton",
        (e) => {
          fthis.back();
        },
        false
      );

      //--back on change browser url
      if (fthis.state.changeRoute)
        window.addEventListener("hashchange", function (e) {
          const pagePath = window.location.href
            .substr(window.location.href.lastIndexOf("/"))
            .includes("/#")
            ? window.location.href.substr(
              window.location.href.lastIndexOf("/") + 2
            )
            : window.location.href.substr(
              window.location.href.lastIndexOf("/") + 1
            );
          fthis.changePage(
            pagePath === "" ? fthis.state.homePageKey : pagePath
          );
        });
    } catch (error) {
      fthis.onError(error);
    }
  }

  async back(options) {
    const fthis = this;
    const backToPage =
      fthis.state.historyPages[fthis.state.historyPages.length - 2];

    if (this.props.beforBack)
      if (!(await this.props.beforBack(backToPage))) return;

    //
    if (this.props.routeKey && !options && backToPage !== undefined) {
      window.location.hash = "#/" + backToPage;
      return;
    }

    // console.log("navigator back with options: ", options);
    try {
      fthis.props.children.forEach((child) => {
        if (child.props.kill) {
          fthis.historyPages = fthis.historyPages.filter(
            (x) => x !== child.key
          );
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
  }
  render() {
    const fthis = this;
    // window.navigation_controller = this;
    const nowPage = this.state.historyPages[this.state.historyPages.length - 1];

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

    return Array.isArray(this.props.children) ? (
      this.props.children
        .filter((child) => typeof child === "object" && !child.props.kill)
        .map((child) => {
          return (
            <div
              // onTouchStart={(e) => {

              // }}

              onTouchMove={(e) => {
                if (child.props.backOnSwipeRight && !fthis.swipeRight) {
                  if (e.touches[0].clientX < 0.2 * innerWidth) {
                    fthis.touchBackPage = nowPage;
                    fthis.swipeRight = true;
                    fthis.setState({
                      swipeRightStart_x: e.touches[0].clientX,
                    });

                    const goToPage = this.state.historyPages[
                      this.state.historyPages.length - 2
                    ];

                    $("#" + goToPage).css("z-index", 0);
                    $("#" + nowPage).css("z-index", 89);
                    $("#" + goToPage).removeClass("hiddenPage");
                    $("#" + goToPage).addClass("showPage overflow_Y_hidden");
                  }
                }
                if (fthis.swipeRight) {
                  fthis.setState({
                    swipeRight_x:
                      e.touches[0].clientX - fthis.state.swipeRightStart_x <= 0
                        ? 1
                        : e.touches[0].clientX - fthis.state.swipeRightStart_x,
                  });
                }
              }}
              onTouchEnd={(e) => {
                const goToPage = this.state.historyPages[
                  this.state.historyPages.length - 2
                ];

                if (
                  fthis.swipeRight &&
                  fthis.state.swipeRight_x > 0.25 * innerWidth
                ) {
                  fthis.callbackFunOnChangePage = () => {
                    $("#" + fthis.touchBackPage).css("left", "");
                    $("#" + goToPage).removeClass("overflow_Y_hidden");
                    fthis.setState({ swipeRight_x: 0 });
                    fthis.swipeRight = false;
                    fthis.touchBackPage = "";
                    fthis.callbackFunOnChangePage = () => { };
                  };

                  // fthis.touchBackPage = nowPage;
                  fthis.back();
                } else {
                  $("#" + nowPage).css("left", "");
                  $("#" + goToPage).css("z-index", "");
                  $("#" + nowPage).css("z-index", "");
                  $("#" + goToPage).removeClass("showPage");
                  $("#" + goToPage).addClass("hiddenPage");
                  fthis.setState({ swipeRight_x: 0 });
                  fthis.swipeRight = false;
                  fthis.touchBackPage = "";
                }

                // }
              }}
              style={{
                left: fthis.swipeRight
                  ? fthis.touchBackPage === child.key
                    ? fthis.state.swipeRight_x
                    : ""
                  : "",
                backgroundColor: child.props.backgroundColor
                  ? child.props.backgroundColor
                  : "#fff",
                height: child.props.height
                  ? child.props.height
                  : fthis.props.height
                    ? this.props.height
                    : "100%",
              }}
              id={child.key}
              key={child.key}
              className={
                fthis.state.startPage === child.key
                  ? child.props && child.props.className
                    ? "showPage scrollPage " + child.props.className
                    : "showPage scrollPage"
                  : child.props.className
                    ? "hiddenPage " + child.props.className
                    : "hiddenPage"
              }
            >
              {nowPage === child.key ||
                fthis.state.historyPages.includes(child.key) ||
                child.props.alwaysLive
                ? React.cloneElement(
                  child,
                  fthis.state.props[child.key],
                  child.props.children
                )
                : null}
            </div>
          );
        })
    ) : (
      <div
        style={{
          backgroundColor: this.props.children.props.backgroundColor
            ? this.props.children.props.backgroundColor
            : "#fff",
          height: this.props.children.props.height
            ? this.props.children.props
            : fthis.props.height
              ? this.props.height
              : "100%",
        }}
        id={this.props.children.key}
        key={this.props.children.key}
        className={
          fthis.state.startPage === child.key
            ? this.props.children.props && this.props.children.props.className
              ? "showPage scrollPage " + this.props.children.props.className
              : "showPage scrollPage"
            : this.props.children.props && this.props.children.props.className
              ? "hiddenPage " + this.props.children.props.className
              : "hiddenPage"
        }
      >
        {nowPage === this.props.children.key ||
          fthis.state.historyPages.includes(this.props.children.key) ||
          this.props.children.props.alwaysLive ? (
          React.cloneElement(
            this.props.children,
            fthis.state.props[this.props.children.key],
            this.props.children.props.children
          ) // this.props.children
        ) : (
          <div />
        )}
      </div>
    );
  }
}

addNavigatorPropTypes(Navigator);

export default Navigator;
