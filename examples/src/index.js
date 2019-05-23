/***  examples/src/index.js ***/
import React from 'react';
import { render} from 'react-dom';
import MyComponent from '../../src/index';
const App = () => (
    <MyComponent />
);
render(<App />, document.getElementById("root"));
