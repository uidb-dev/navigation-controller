import React from 'react';
import $ from './jquery-3.3.1.min';
import './animation.css';


export default class Navigator extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            historyPages: this.props.historyPages,
            // startFromHome=null
        }

        this.bezy = false;
        this.listLevelPages = this.props.listLevelPages;
        // this.listLevelPages["home"] = 0;

        this.ChangePage = this.ChangePage.bind(this);
    }



    //----navigator and animation----///
    funAnimationIn1(goToPage, fromPage) {
        //--נכנסים דף פנימה Up--//
        let callbackFun = () => {
            this.funAnimationIn2(goToPage, fromPage);
            document.getElementById(goToPage).removeEventListener("webkitAnimationEnd", callbackFun);
        };
        document.getElementById(goToPage).addEventListener("webkitAnimationEnd", callbackFun);

        this.bezy = true;
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
        this.bezy = false;
    }

    funAnimationOut1(goToPage, fromPage) {
        //--חזרה בדפים Down--//  
        let callbackFun = () => {
            this.funAnimationOut2(goToPage, fromPage);
            document.getElementById(fromPage).removeEventListener("webkitAnimationEnd", callbackFun);
        };
        document.getElementById(fromPage).addEventListener("webkitAnimationEnd", callbackFun);
        this.bezy = true;
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
        this.bezy = false;
    }


    ChangePage(goToPage, fromPage, animation, timeAnimationInMS) {

        if (!this.bezy) {
            const fthis = this;

            if (fromPage === null) {
                fromPage = "" + this.state.historyPages[this.state.historyPages.length - 1] + "";
            }

            //--זמן האנימציה
            const timeAnimation = timeAnimationInMS !== null ? timeAnimationInMS : 250;//250;//ms

            if (goToPage !== fromPage) {
                //---ניהול חזרות----//
                this.bezy = true;
                //סיום האפליקציה, סגור
                if (this.state.historyPages.length === 1
                    && goToPage === undefined) {
                    console.log('"window.navigator.app.exitApp()"');
                    fthis.state.showSwalLater
                        ? fthis.state.myChildrens.swal.runSwal(true)
                        : window.navigator.app.exitApp();
                } else {
                    ///שמור היסטוריה
                    let new_historyPages = this.state.historyPages;

                    if (this.listLevelPages[goToPage] <= this.listLevelPages[fromPage]) {
                        //חוזרים אחורה, מחק את כל הדפים שהרמה שלהם גבוהה משלי.
                        //new_historyPages.splice(new_historyPages.length - 1, 1);
                        new_historyPages = new_historyPages.filter((x) => this.listLevelPages[x] < this.listLevelPages[goToPage]);
                    }
                    new_historyPages.push(goToPage);
                    //שמירת שינויים בהיסטוריה
                    this.setState({
                        historyPages: new_historyPages
                    });
                }

                //----navigator and animation----///

                if (this.listLevelPages[goToPage] > this.listLevelPages[fromPage]) {
                    //--נכנסים דף פנימה Up--//
                    this.funAnimationIn1(goToPage, fromPage);

                    if (this.listLevelPages[goToPage] === 1) {
                        //Up from level 0 to level 1
                        $('#' + goToPage).css('animation', (animation !== null ? animation : 'slideInRight') + " " + timeAnimation + 'ms');

                    } else { //else if (this.listLevelPages[goToPage] === 2) {
                        //Up from level 1 to level 2
                        $('#' + goToPage).css('animation', (animation !== null ? animation : 'zoomIn') + " " + timeAnimation + 'ms');
                    }
                } else {
                    //--חזרה בדפים Down--//   
                    this.funAnimationOut1(goToPage, fromPage);
                    if (this.listLevelPages[fromPage] === 1) {
                        //Down from level 1 to level 0
                        $('#' + fromPage).css('animation', (animation !== null ? animation : 'slideOutRight') + " " + timeAnimation + 'ms');
                    }
                    else { //else if (this.listLevelPages[goToPage] === 1) {
                        //Down from level 2 to level 1
                        $('#' + fromPage).css('animation', (animation !== null ? animation : 'zoomOut') + " " + timeAnimation + 'ms');

                    }
                }
                // //עיצוב כפתור חזרה
                // if (goToPage === "home") {
                //     $('#backInHeader').css('display', "none");
                // } else {
                //     $('#backInHeader').css('display', "flex");
                // }
            }
        }
    }
    componentWillMount() {
        this.props.myApp.callbackNavigator = this;
    }

    render() {
        const fthis = this;
        return <div id="navigatorBack" key="navigatorBack"
            style={{ display: none }}
            onClick={() => {
                fthis.ChangePage(this.state.historyPages[this.state.historyPages.length - 2]
                    , this.state.historyPages[this.state.historyPages.length - 1])
            }}></div>
            ;
    }
}