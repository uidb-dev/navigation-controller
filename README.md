# react.cordova-navigation_controller

## Plugin for react

It's manager for your pages like mobile app.<br>

<br/><br/>

I dedicate a considerable amount of my free time to developing and maintaining this plugin, along with my other Open Source software. To help ensure this Cli is kept updated, new features are added and bugfixes are implemented quickly, please donate a couple of dollars (or a little more if you can stretch) as this will help me to afford to dedicate time to its maintenance. Please consider donating if you're using this plugin in an app that makes you money, if you're being paid to make the app, if you're asking for new features or priority bug fixes.

<a href="https://paypal.me/orchoban">
  <img src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG_global.gif" width="200px" alt=""/>
</a>

<br/>

#### `import Navigator from 'react.cordova-navigation_controller';`

<br>
For example:
In the render function return

```
<Navigator onRef={ref => (this.navigatorRef = ref)} onError={(error)=>{} }>


         <MyHomePage key="home" levelPage={0} />

          <AboutPage key="about"
           levelPage={1}
            transitionIn="fadeInRight"
            transitionOut= "fadeOutLeft"
           />


 </Navigator>
```

**Note: prop `levelPage` important to manage the returs (from back button) in the structure of a tree**<br><br>

To change page you get the ref and do:

#### `this.navigatorRef.changePage("about");`

the option to changePage it's:

```
this.navigatorRef.changePage(
                goToPage //Required
              ,{options}// Not requred
              );
```

```
options = {  animatioPageIn:"fadeInRight" // have defult
            , animationPageOut:"fadeOutLeft" // have defult
            , timeAnimationInMS:integer // defult=250(ms)
            , callbackFun:function
            , props:{}
              }
```

*`animationIn` and `animationOut` need name animate from [here](https://daneden.github.io/animate.css/) <br>
*the animate.css includ in this package

## use with react-router
```
import React from "react";

import Navigator from "react.cordova-navigation_controller";

import { BrowserRouter as Router, Route, useParams } from "react-router-dom";

export default function Root() {
  return (
    <Router>
      <Route path={["/:key", "/"]}>
        <App />
      </Route>
    </Router>
  );
}

const App = (props) => {
  const { key } = useParams();

  return (
    <Navigator routerKey={key} changeRoute={false}>
      <HomePage key="home" levelPage={0} />

      <Page2 key="page2" levelPage={1} />
    </Navigator>
  );
};
```


## Options:

### Navigator props

<table>
  <thead>
    <tr>
      <th>prop</th>
      <th>type</th>
       <th>required</th>
       <th>defult</th>
     <th>node</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>onRef</td>
     <td></td>
      <td>required</td>
     <td>-</td>
     <td> onRef={ref => (this.navigatorRef = ref)} </td>
    </tr>
     <tr>
      <td>errorPageKey</td>
     <td>string</td>
      <td>optional</td>
     <td>-</td>
     <td></td>
    </tr>
     <tr>
      <td>onError</td>
     <td>function</td>
      <td>optional</td>
     <td>-</td>
     <td> onError={error => ( do something )} </td>
    </tr>
       <tr>
      <td>beforBack</td>
     <td>function</td>
      <td>optional</td>
     <td>-</td>
     <td>For android backbutton only.  beforBack={() =>{ ( do something and return false to stop back page process or retun true. )}} </td>
    </tr>
      <tr>
      <td>beforExit</td>
     <td>function</td>
      <td>optional</td>
     <td>-</td>
     <td>For android backbutton only.  beforExit={() =>{ ( do something and return false to retun true to exit the app. )}} </td>
    </tr>
    <tr>
      <td>key</td>
     <td>string</td>
      <td>required</td>
     <td>-</td>
     <td></td>
    </tr>
     <tr>
      <td>height</td>
     <td>string or integer</td>
      <td>optional</td>
      <td>"100%"</td>
      <td></td>
    </tr>
     <tr>
      <td>onChangePage</td>
     <td>function</td>
      <td>optional</td>
       <td>-</td>
       <td>(nowPageKey,levelAction) => { ... }</td>
    </tr>
   <tr>
      <td>beforChangePage</td>
     <td>function</td>
      <td>optional</td>
       <td>-</td>
       <td>(goToPageKey,levelAction) => { ... }</td>
    </tr>
    <tr>
      <tr>
      <td>changeRoute</td>
     <td>boolean</td>
      <td>optional</td>
       <td>true (on cordova native platforms => false)</td>
       <td>Determines whether to change the URL to the component key</td>
    </tr>
      <td>homePageKey</td>
     <td>string</td>
      <td>optional</td>
       <td>The key of the first child</td>
       <td></td>
    </tr>
  </tbody>
</table>
*levelAction return "Out" or "In" or "SameLevel"

### Child props

<table>
  <thead>
    <tr>
      <th>prop</th>
      <th>type</th>
       <th>required</th>
       <th>defult</th>
     <th>node</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>levelPage</td>
     <td>integer</td>
      <td>required</td>
     <td>-</td>
     <td>important!</td>
    </tr>
    <tr>
      <td>backgroundColor</td>
     <td>string</td>
      <td>optional</td>
     <td>#fff</td>
     <td></td>
    </tr>
     <tr>
      <td>height</td>
     <td>string or integer</td>
      <td>optional</td>
      <td>"100%"</td>
      <td></td>
    </tr>
     <tr>
      <td>backOnSwipeRight</td>
     <td>boolean</td>
      <td>optional</td>
       <td>false</td>
       <td>May be problematic with css "padding-left" </td>
    </tr>
       <tr>
      <td>transitionIn</td>
     <td>string</td>
      <td>optional</td>
     <td>-</td>
     <td></td>
    </tr>
     <tr>
      <td>transitionOut</td>
     <td>string</td>
      <td>optional</td>
     <td>-</td>
     <td></td>
    </tr>
      <tr>
      <td>animationTimeInMS</td>
     <td>integer</td>
      <td>optional</td>
     <td>-</td>
     <td></td>
    </tr>
     <tr>
      <td>props</td>
     <td>json</td>
      <td>optional</td>
     <td>-</td>
     <td>props={{myPropExample:this.state.example}}</td>
    </tr>
       <tr>
      <td>kill</td>
     <td>boolean</td>
      <td>optional</td>
     <td>-</td>
     <td></td>
    </tr>
   <tr>
      <td>alwaysLive</td>
     <td>boolean</td>
      <td>optional</td>
       <td>false</td>
       <td>Don't kill the child. Life is always in the background</td>
    </tr>
    
  </tbody>
</table>

#### Check what is page now

```
const nowPage= this.navigatorRef.nowPage;
```

#### Get the historyPages list

```
const historyPages= this.navigatorRef.historyPages();
```

#### Get the listLevelPages list

```
const listLevelPages= this.navigatorRef.listLevelPages();
```

#### Back 1 page history

```
this.navigatorRef.back();
```

or

```
this.navigatorRef.back({options...});
```

options => { animationIn:integer // have defult , animationOut:string // have defult , timeAnimationInMS:integer // defult=250(ms) , callbackFun:function , props:{...} }

#### Check if the mangerPages is busy

```
const navigator_busy= this.navigatorRef.busy;
```

\*busy return boolean  
<br><br><br>

## If you have any problem, please let us know [here](https://github.com/orchoban/react.cordova-navigation_controller/issues), and we will make an effort to resolve it soon

## Feel free to editing the code yourself: go to [src/index.js](https://github.com/orchoban/react.cordova-navigation_controller/blob/master/src/index.js)

## If you have any private problems please ask to support [here] (https://www.fiverr.com/share/5bpN56)

Credit:
Arik Wald
<br><br>
Credit animated:
**_animate.css -https://daneden.github.io/animate.css/_**
