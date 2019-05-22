# navigator-cordova-react_js

**To run it you have to JQuery**

## Scripts code
It's manager for your pages like mobile app.<br>

#### `import ManagerPages from './navigator-cordova-react_js';`

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

<br>

To change page you need get the component that you send in 'myComponentApp' and do:
#### `myComponentApp.managerPages.changePage("about");` 
the option to changePage it's:
```
myComponentApp.managerPages.changePage(
                goToPage //it's must
                ,animationIn//have defult
                ,animationOut//have defult
                //'animationIn' and 'animationOut' need name of the animated from https://daneden.github.io/animate.css/  //--(c) Daniel Eden (c)--//  
                , timeAnimationInMS // defult=250//ms
                , callbackFun
              );
```

