# react.cordova-navigation_controller

## Plugin for react
It's manager for your pages like mobile app.<br>

#### `import Navigator from './react.cordova-navigation_controller';`

<br>
In the render function return

 ```
 <Navigator
       onRef={ref => (this.navigatorRef = ref)} // Required
        height={"100%"}
        onChangePage={(nowPageKey,levelAction) => { ... }}// levelAction==>> "Out"||"In"||"SameLevel"  
         beforChangePage={(goToPageKey,levelAction) => { ... }}// levelAction==>> "Out"||"In"||"SameLevel"    
        homePageKey={"home"} // defult==>> The key of the first child
        >

            <MyHomePage key="home" levelPage={0} 
           //alwaysLive={true} // defult==>> false
           //backgroundColor="..." // defult==>> #fff
            />   
            <AboutPage key="about" levelPage={1} />
  
  </Navigator>
```
**Note: prop `levelPage` important to manage the returs (from back button) in the structure of a tree**<br><br>

To change page you get the ref and do:
#### `this.navigator.changePage("about");` 
the option to changePage it's:
```
this.navigatorRef.changePage(
                goToPage //Required
                ,animationIn//have defult
                ,animationOut//have defult ==>> 'animationIn' and 'animationOut' need name of the animated
                , timeAnimationInMS // defult=250//ms
                , callbackFun
              );
```
*`animationIn` and `animationOut` need name animate from https://daneden.github.io/animate.css/  <br> 
*the animate.css includ in this package

## Options:

### Get the historyPages list
```
const historyPages= this.navigatorRef.historyPages();
```

### Get the listLevelPages list
```
const listLevelPages= navigatorRef.listLevelPages();
```
### Back 1 page history
```
this.navigatorRef.back();
```

### Check if the mangerPages is busy 
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
