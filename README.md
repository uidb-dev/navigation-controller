# react.cordova-manager_pages

## Scripts code
It's manager for your pages like mobile app.<br>

#### `import ManagerPages from './react.cordova-manager_pages';`

<br>
In the render function return

 ```
 <ManagerPages
        myComponentApp={this}
        onChangePage={(nowPageKey) => { ... }}    
        homePageKey={"home"}>
            <MyHomePage key="home" levelPage={0} />
            <AboutPage key="about" levelPage={1} />
  </ManagerPages>
```
**Node: prop `levelPage` important to manage the returs (from back button) in the structure of a tree**<br><br>

To change page you need get the component that you send in 'myComponentApp' and do:
#### `myComponentApp.managerPages.changePage("about");` 
the option to changePage it's:
```
myComponentApp.managerPages.changePage(
                goToPage //it's must
                ,animationIn//have defult
                ,animationOut//have defult
                //'animationIn' and 'animationOut' need name of the animated
                , timeAnimationInMS // defult=250//ms
                , callbackFun
              );
```
*`animationIn` and `animationOut` need name animate from https://daneden.github.io/animate.css/  <br> 
*the animate.css includ in this package

## Options:

### Get the historyPages list
```
const historyPages= myComponentApp.managerPages.historyPages();
```

### Get the listLevelPages list
```
const listLevelPages= myComponentApp.managerPages.listLevelPages();
```


### Check if the mangerPages is bezy
```
const managerPages_bezy= myComponentApp.managerPages.bezy;
```
*bezy return boolean  
<br><br><br>

Credit animated:
 ***animate.css -https://daneden.github.io/animate.css/***
