# react.cordova-navigation_controller

## Plugin for react
It's manager for your pages like mobile app.<br>

#### `import Navigator from './mobile-navigation-controller';`

<br>
For example:
In the render function return

 ```
 <Navigator onRef={ref => (this.navigatorRef = ref)} >
         
         
          <MyHomePage key="home" levelPage={0} />   
           
           <AboutPage key="about" 
            levelPage={1}   
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
options => {  animationIn:integer // have defult
            , animationOut:string // have defult
            , timeAnimationInMS:integer // defult=250(ms)
            , callbackFun:function
            , props:{...} 
              }

*`animationIn` and `animationOut` need name animate from [here](https://daneden.github.io/animate.css/)  <br> 
*the animate.css includ in this package

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
      <td>homePageKey</td>
     <td>string</td>
      <td>optional</td>
       <td>The key of the first child</td>
       <td>(nowPageKey,levelAction) => { ... }</td>
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

#### Check if the mangerPages is busy 
```
const navigator_busy= this.navigatorRef.busy;
```
*busy return boolean  
<br><br><br>



## If you have any problem, please let us know [here](https://github.com/orchoban/react.cordova-navigation_controller/issues), and we will make an effort to resolve it soon
## Feel free to editing the code yourself: go to [src/index.js](https://github.com/orchoban/react.cordova-navigation_controller/blob/master/src/index.js)




Credit:
Arik Wald
<br><br>
Credit animated:
 ***animate.css -https://daneden.github.io/animate.css/***
