# react.cordova-navigation_controller

## Plugin for react
It's manager for your pages like mobile app.<br>

#### `import Navigator from './react.cordova-navigation_controller';`

<br>
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
options=>{  animationIn:integer // have defult
                ,animationOut:string // have defult
                , timeAnimationInMS:integer // defult=250(ms)
                , callbackFun:function}

*`animationIn` and `animationOut` need name animate from https://daneden.github.io/animate.css/  <br> 
*the animate.css includ in this package

## Options:

### Navigator props 
``key={string}`` Required
<br>
``height={...}``
<br>
``onChangePage={(nowPageKey,levelAction) => { ... }}`` levelAction==>> "Out"||"In"||"SameLevel"
<br>
``beforChangePage={(goToPageKey,levelAction) => { ... }}`` levelAction==>> "Out"||"In"||"SameLevel"
<br>
``homePageKey={"home"}``  defult==>> The key of the first child

### Child props 
``onRef={ref => (this.navigatorRef = ref)}`` required
<br>
``levelPage=={integer}`` important
<br>
``backgroundColor="..."``  defult==>> #fff
<br>
`` //alwaysLive={true}``defult==>> false



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


Credit:
Arik Wald
<br><br>
Credit animated:
 ***animate.css -https://daneden.github.io/animate.css/***
