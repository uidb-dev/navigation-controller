import React from 'react';
import $ from './jquery-3.3.1.min';
import './styles.css';
import './animate.css';

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


        if (mobileMode) {
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


        const historyPages = [];
        historyPages.push(homePage);
        if (startPage !== homePage)
            historyPages.push(startPage);


        this.state = {
            historyPages: historyPages,
            nowPage: startPage,
            homePageKey: homePage,
            height: this.props.height === null ? "100%" : this.props.height,
            startPage: startPage,
            mobileMode: mobileMode
        }
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
        $('#' + fromPage).css('z-index', "");
        $('#' + fromPage).removeClass('showPage');
        $('#' + fromPage).removeClass('scrollPage');
        $('#' + fromPage).addClass('hiddenPage');
        this.busy = false;
        this.setState({ nowPage: goToPage });

        if (this.props.onChangePage !== undefined)
            this.props.onChangePage(this.state.historyPages[this.state.historyPages.length - 1], this.compareTwoPagesLavel(goToPage, fromPage));
    }

    compareTwoPagesLavel(goToPage, fromPage) {
        if (this.listLevelPages[goToPage] < this.listLevelPages[fromPage])
            return "Out";
        if (this.listLevelPages[goToPage] > this.listLevelPages[fromPage])
            return "In";
        return "SameLevel";

    }

    changePage(goToPage, animationIn, animationOut, timeAnimationInMS, callbackFun) {

        if (!this.busy) {
            const fthis = this;

            const fromPage = "" + this.historyPages[this.historyPages.length - 1] + "";

            //--animation time defult
            const timeAnimation = timeAnimationInMS !== undefined && timeAnimationInMS !== null ? timeAnimationInMS :
                250; //ms

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

                if (!window.cordova)

                    window.location.href = window.location.href.substr(0,
                        window.location.href.lastIndexOf("/") + 1) +
                        "#" + (goToPage !== this.state.homePageKey ? goToPage : "");
                else if (window.cordova.platformId === "browser")
                    window.location.href = window.location.href.substr(0,
                        window.location.href.lastIndexOf("/") + 1) +
                        "#" + (goToPage !== this.state.homePageKey ? goToPage : "");


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


                if (callbackFun !== undefined)
                    callbackFun();
            }
        }

    }

    componentWillMount() {
        const fthis = this;
        if (fthis.state.mobileMode) {

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

    back() {
        this.changePage(this.state.historyPages[this.state.historyPages.length - 2]);
    }
    render() {
        const fthis = this;
        // window.navigation_controller = this;
        const nowPage = this.state.historyPages[this.state.historyPages.length - 1];
        this.historyPages = this.state.historyPages;
        this.nowPage = this.state.nowPage;


        this.historyPages = this.state.historyPages.slice();
        return Array.isArray(this.props.children)
            ? this.props.children.map(child => {
                return <div style={{
                    backgroundColor: child.props.backgroundColor ? child.props.backgroundColor : "#fff"
                    , height: child.props.height ? child.props.height : fthis.state.height
                }}
                    id={child.key} key={child.key} className={fthis.state.startPage === child.key ? "showPage scrollPage" : "hiddenPage"}>
                    {nowPage === child.key || fthis.state.historyPages.includes(child.key) || child.props.alwaysLive
                        ? child
                        : <div />}
                </div>
            })
            : <div style={{
                backgroundColor: this.props.children.props.backgroundColor ? this.props.children.props.backgroundColor : "#fff"
                , height: this.props.children.props.height ? this.props.children.props : fthis.state.height
            }}
                id={this.props.children.key} key={this.props.children.key} className={fthis.state.startPage === this.props.children.key ? "showPage scrollPage" : "hiddenPage"}>
                {nowPage === this.props.children.key || fthis.state.historyPages.includes(this.props.children.key) || this.props.children.props.alwaysLive
                    ? this.props.children
                    : <div />}
            </div>;
    }

}