import React from 'react';
import $ from './jquery-3.3.1.min';
import './styles.css';
import './animate.css';
import { setTimeout } from 'timers';

export default class Navigator extends React.Component {

    constructor(props) {
        super(props);

        let startPage = "";
        let mobileMode = false;
        if (window.cordova) {
            if (window.cordova.platformId !== "browser")
                mobileMode = true;
        }

        const homePage = this.props.homePageKey ? this.props.homePageKey :
            Array.isArray(this.props.children)
                ? this.props.children[0].key
                : this.props.children.key;

        let changeRoute = true;//default
        if (mobileMode)
            changeRoute = false;
        if (this.props.changeRoute !== undefined)
            changeRoute = this.props.changeRoute;

        if (!changeRoute) {
            startPage = homePage;
        } else {

            startPage = window.location.href.substr(
                window.location.href.lastIndexOf("/")) === "/" ||
                window.location.href.substr(
                    window.location.href.lastIndexOf("/")) === "/#" ?
                homePage :
                window.location.href.substr(
                    window.location.href.lastIndexOf("/") + 2);
        }
        this.touchBackPage = "";

        this.callbackFunOnChangePage = () => { };

        const historyPages = [];
        historyPages.push(homePage);
        if (startPage !== homePage)
            historyPages.push(startPage);


        this.state = {
            changeRoute: changeRoute,
            historyPages: historyPages,
            nowPage: startPage,
            homePageKey: homePage,
            // height: this.props.height ? this.props.height : "100%",
            startPage: startPage,
            mobileMode: mobileMode,
            swipeRight_x: 0,
<<<<<<< HEAD
            swipeRightStart_x: 0,
=======
>>>>>>> parent of 6a76068... @0.0.1
            props: []
        }

        this.swipeRight = false;
        // this.myComponentApp = this.props.myComponentApp;

        this.historyPages = this.state.historyPages;

        this.listLevelPages = [];

        let listLevelPages = this.listLevelPages;

        Array.isArray(this.props.children) ?
            this.props.children.forEach((child) => {
                listLevelPages[child.key] =
                    child.props.levelPage === undefined ?
                        child.key === homePage ?
                            0 : 99 :
                        child.props.levelPage
            }) :
            listLevelPages[this.props.children.key] =
            this.props.children.props.levelPage === undefined ?
                this.props.children.key === homePage ?
                    0 : 99 :
                this.props.children.props.levelPage;


        // const childrenWithProps = React.Children.map(this.props.children, child =>
        //   React.cloneElement(child, { doSomething: this.doSomething })
        // );
        // this.props.nowPage(this.historyPages[this.historyPages.length - 1]);

        this.busy = false;


        this.props.onRef(this);

        this.changePage = this.changePage.bind(this);


        if (Array.isArray(this.props.children))
            this.props.children.map(child => {
                if (child.key === null || child.key === "")
                    window.console.log("react.cordova-navigation_controller: key value it's required");
            })

    }

    componentDidMount() {
        if (this.props.onChangePage !== undefined)
            this.props.onChangePage(this.state.historyPages[this.state.historyPages.length - 1], "In");


    }
    //----navigator and animation----///
    funAnimationIn1(goToPage, fromPage) {
        const fthis = this;

        if (this.props.beforChangePage !== undefined)
            this.props.beforChangePage(goToPage, this.compareTwoPagesLavel(goToPage, fromPage));

        //--נכנסים דף פנימה Up--//
        let callbackFun = () => {
            fthis.funAnimationIn2(goToPage, fromPage);
            document.getElementById(goToPage).removeEventListener("webkitAnimationEnd", callbackFun);
        };

        document.getElementById(goToPage).addEventListener("webkitAnimationEnd", callbackFun, false);

        this.busy = true;
        $('#' + goToPage).removeClass('hiddenPage');
        $('#' + goToPage).addClass('scrollPage showPage');
        $('#' + fromPage).css('z-index', 0);
        $('#' + goToPage).css('z-index', 89);
    }


    funAnimationIn2(goToPage, fromPage) {
        $('#' + fromPage).css('z-index', "");
        $('#' + goToPage).css('z-index', "");
        $('#' + goToPage).css('animation', '');
        $('#' + fromPage).removeClass('showPage');
        $('#' + fromPage).removeClass('scrollPage');
        $('#' + fromPage).addClass('hiddenPage');
        this.busy = false;
        this.setState({ nowPage: goToPage });

        if (this.props.onChangePage !== undefined)
            this.props.onChangePage(this.state.historyPages[this.state.historyPages.length - 1], this.compareTwoPagesLavel(goToPage, fromPage));
    }

    funAnimationOut1(goToPage, fromPage) {
        //--חזרה בדפים Down--//  

        if (this.props.beforChangePage !== undefined)
            this.props.beforChangePage(goToPage, this.compareTwoPagesLavel(goToPage, fromPage));

        let callbackFun = () => {
            this.funAnimationOut2(goToPage, fromPage);
            document.getElementById(fromPage).removeEventListener("webkitAnimationEnd", callbackFun);
        };
        document.getElementById(fromPage).addEventListener("webkitAnimationEnd", callbackFun);
        this.busy = true;
        $('#' + goToPage).css('z-index', 0);
        $('#' + fromPage).css('z-index', 89);
        $('#' + goToPage).removeClass('hiddenPage');
        $('#' + goToPage).addClass('scrollPage showPage');
    }
    funAnimationOut2(goToPage, fromPage) {
        $('#' + fromPage).css('animation', '');
        $('#' + goToPage).css('z-index', "");
        $('#' + goToPage).css('left', "");
        $('#' + fromPage).css('z-index', "");
        $('#' + fromPage).removeClass('showPage');
        $('#' + fromPage).removeClass('scrollPage');
        $('#' + fromPage).addClass('hiddenPage');
        this.busy = false;
        this.setState({ nowPage: goToPage });

        if (this.props.onChangePage !== undefined)
            this.props.onChangePage(this.state.historyPages[this.state.historyPages.length - 1], this.compareTwoPagesLavel(goToPage, fromPage));

        this.callbackFunOnChangePage();
    }

    compareTwoPagesLavel(goToPage, fromPage) {
        if (this.listLevelPages[goToPage] < this.listLevelPages[fromPage])
            return "Out";
        if (this.listLevelPages[goToPage] > this.listLevelPages[fromPage])
            return "In";
        return "SameLevel";

    }


    changePage(goToPage, options) {

        options = options === undefined ? [] : options;

        const {
            props = null
            , animationIn = this.swipeRight ? 'slideInRight' : null
            , timeAnimationInMS = 250
            , animationOut = this.swipeRight ? 'slideOutRight' : null
            , callbackFun = null } = options;


        if (props !== null) {
            // let oldProps = this.state.props;
            let newProps = [];
            newProps[goToPage] = props;
            this.setState({ props: newProps });
        } else {

        }



        if (!this.busy) {
            const fthis = this;

            const fromPage = "" + this.historyPages[this.historyPages.length - 1] + "";

            //--animation time defult
            const timeAnimation = timeAnimationInMS;  //param.timeAnimationInMS !== undefined && param.timeAnimationInMS !== null ? param.timeAnimationInMS :
            //     250; //ms

            if (goToPage !== fromPage) {
                //---ניהול חזרות----//
                this.busy = true;
                //סיום האפליקציה, סגור
                if (this.state.historyPages.length === 1 &&
                    goToPage === undefined) {
                    console.log('"window.navigator.app.exitApp()"');
                    // fthis.showSwalLater ?
                    //     fthis.myChildrens.swal.runSwal(true) :
                    window.navigator.app.exitApp();
                } else {
                    ///שמור היסטוריה
                    let new_historyPages = this.state.historyPages.slice();

                    if (this.listLevelPages[goToPage] <= this.listLevelPages[fromPage]) {
                        //חוזרים אחורה, מחק את כל הדפים שהרמה שלהם גבוהה משלי.
                        //new_historyPages.splice(new_historyPages.length - 1, 1);
                        new_historyPages = new_historyPages.filter((x) => this.listLevelPages[x] < this.listLevelPages[goToPage]);
                    }
                    new_historyPages.push(goToPage);
                    //שמירת שינויים בהיסטוריה
                    this.setState({ historyPages: new_historyPages });
                }

                if (this.state.changeRoute) {

                    window.location.href = window.location.href.substr(0,
                        window.location.href.lastIndexOf("/") + 1) +
                        "#" + (goToPage !== this.state.homePageKey ? goToPage : "");
                }


                //----navigator and animation----///

                if (this.listLevelPages[goToPage] > this.listLevelPages[fromPage]) {
                    //--נכנסים דף פנימה Up--//
                    this.funAnimationIn1(goToPage, fromPage);

                    if (this.listLevelPages[goToPage] === 1) {
                        //Up from level 0 to level 1
                        $('#' + goToPage).css('animation', (animationIn !== null && animationIn !== undefined ? animationIn : 'slideInRight') + " " + timeAnimation + 'ms');

                    } else { //else if (this.listLevelPages[goToPage] === 2) {
                        //Up from level 1 to level 2
                        $('#' + goToPage).css('animation', (animationIn !== null && animationIn !== undefined ? animationIn : 'zoomIn') + " " + timeAnimation + 'ms');
                    }
                } else {
                    //--חזרה בדפים Down--//   
                    this.funAnimationOut1(goToPage, fromPage);
                    if (this.listLevelPages[fromPage] === 1) {
                        //Down from level 1 to level 0
                        $('#' + fromPage).css('animation', (animationOut !== null && animationOut !== undefined ? animationOut : 'slideOutRight') + " " + timeAnimation + 'ms');
                    } else { //else if (this.listLevelPages[goToPage] === 1) {
                        //Down from level 2 to level 1
                        $('#' + fromPage).css('animation', (animationOut !== null && animationOut !== undefined ? animationOut : 'zoomOut') + " " + timeAnimation + 'ms');

                    }
                }
                // //עיצוב כפתור חזרה
                // if (goToPage === "home") {
                //     $('#navigatorBack').css('display', "none");
                // } else {
                //     $('#navigatorBack').css('display', "flex");
                // }




                if (callbackFun !== undefined && callbackFun !== null)
                    callbackFun();

            }
        }

    }

    componentWillMount() {
        const fthis = this;
        if (!fthis.state.changeRoute) {

            // //---lock portrait
            // window.screen.orientation.lock('portrait');

            //--back button in android

            document.addEventListener("backbutton", (e) => {
                fthis.back();
            }, false);
        } else {
            //--back on change browser url
            window.addEventListener("hashchange", function (e) {
                fthis.changePage(
                    window.location.href.substr(
                        window.location.href.lastIndexOf("/") + 2) === "" ? fthis.state.homePageKey :
                        window.location.href.substr(
                            window.location.href.lastIndexOf("/") + 2)
                );
            });
        }


    }

    back(options) {
        if (options === null || options === undefined) {
            this.changePage(this.state.historyPages[this.state.historyPages.length - 2]);
        } else {
            this.changePage(this.state.historyPages[this.state.historyPages.length - 2], options);
        }

    }

    render() {
<<<<<<< HEAD

=======
        // debugger
>>>>>>> parent of 6a76068... @0.0.1
        const fthis = this;
        // window.navigation_controller = this;
        const nowPage = this.state.historyPages[this.state.historyPages.length - 1];
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
        return Array.isArray(this.props.children)
            ? this.props.children.map(child => {
                return <div
<<<<<<< HEAD
                    // onTouchStart={(e) => {
                        
                      
                    // }}

                    
                    onTouchMove={(e) => {
                        if (child.props.backOnSwipeRight &&!fthis.swipeRight) {
                            if (e.touches[0].clientX < (0.20 * innerWidth)) {
                                fthis.touchBackPage = nowPage;
                                fthis.swipeRight = true;
                                fthis.setState({ swipeRightStart_x: e.touches[0].clientX });
=======
                    onTouchStart={(e) => {
                        if (child.props.backOnSwipeRight) {
                            if (e.touches[0].clientX < (0.20 * innerWidth)) {
                                fthis.touchBackPage = nowPage;
                                fthis.swipeRight = true;
                                fthis.setState({ swipeRight_x: e.touches[0].clientX });
>>>>>>> parent of 6a76068... @0.0.1

                                const goToPage = this.state.historyPages[this.state.historyPages.length - 2];

                                $('#' + goToPage).css('z-index', 0);
                                $('#' + nowPage).css('z-index', 89);
                                $('#' + goToPage).removeClass('hiddenPage');
                                $('#' + goToPage).addClass('showPage overflow_Y_hidden');
                            }

                        }
<<<<<<< HEAD
                            if (fthis.swipeRight) {
                            fthis.setState({ swipeRight_x: (e.touches[0].clientX - fthis.state.swipeRightStart_x) <= 0 ? 1 : e.touches[0].clientX - fthis.state.swipeRightStart_x });
=======
                    }}
                    onTouchMove={(e) => {
                        if (fthis.swipeRight) {
                            fthis.setState({ swipeRight_x: e.touches[0].clientX });
>>>>>>> parent of 6a76068... @0.0.1
                        }
                    }}
                    onTouchEnd={(e) => {
                        const goToPage = this.state.historyPages[this.state.historyPages.length - 2];

                        if (fthis.swipeRight && fthis.state.swipeRight_x > (0.25 * innerWidth)) {

                            fthis.callbackFunOnChangePage = () => {
                                $('#' + fthis.touchBackPage).css('left', "");
                                $('#' + goToPage).removeClass('overflow_Y_hidden');
                                fthis.setState({ swipeRight_x: 0 });
                                fthis.swipeRight = false;
                                fthis.touchBackPage = "";
                                fthis.callbackFunOnChangePage = () => { };
                            }


                            // fthis.touchBackPage = nowPage;
                            fthis.back();


                        } else {
                            $('#' + nowPage).css('left', "");
                            $('#' + goToPage).css('z-index', "");
                            $('#' + nowPage).css('z-index', "");
                            $('#' + goToPage).removeClass('showPage');
                            $('#' + goToPage).addClass('hiddenPage');
                            fthis.setState({ swipeRight_x: 0 });
                            fthis.swipeRight = false;
                            fthis.touchBackPage = "";
                        }

                        // }
                    }}
                    style={{
                        left: fthis.swipeRight ? (fthis.touchBackPage === child.key ? fthis.state.swipeRight_x : "") : "",
                        backgroundColor: child.props.backgroundColor ? child.props.backgroundColor : "#fff"
                        , height: child.props.height ? child.props.height : fthis.props.height ? this.props.height : "100%"
                    }}
                    id={child.key} key={child.key} className={fthis.state.startPage === child.key ? "showPage scrollPage" : "hiddenPage"}>
                    {nowPage === child.key || fthis.state.historyPages.includes(child.key) || child.props.alwaysLive
                        ? React.cloneElement(
                            child,
                            fthis.state.props[child.key],
                            child.props.children,
                        )
                        : <div />}
                </div>
            })
            : <div style={{
                backgroundColor: this.props.children.props.backgroundColor ? this.props.children.props.backgroundColor : "#fff"
                , height: this.props.children.props.height ? this.props.children.props : fthis.props.height ? this.props.height : "100%"
            }}
                id={this.props.children.key} key={this.props.children.key} className={fthis.state.startPage === this.props.children.key ? "showPage scrollPage" : "hiddenPage"}>
                {nowPage === this.props.children.key || fthis.state.historyPages.includes(this.props.children.key) || this.props.children.props.alwaysLive
                    ? React.cloneElement(
                        this.props.children,
                        fthis.state.props[this.props.children.key],
                        this.props.children.props.children,
                    )// this.props.children
                    : <div />}
            </div>;
    }

}