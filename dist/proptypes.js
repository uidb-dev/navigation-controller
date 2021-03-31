"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addNavigatorPropTypes = addNavigatorPropTypes;
exports.addChildPropTypes = addChildPropTypes;

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function addNavigatorPropTypes(Component) {
  Component.propTypes = {
    mobileMode: _propTypes2.default.bool,
    homePageKey: _propTypes2.default.string,
    changeRoute: _propTypes2.default.bool,
    children: _propTypes2.default.oneOfType([_propTypes2.default.arrayOf(_propTypes2.default.element), _propTypes2.default.element]).isRequired,
    routeKey: _propTypes2.default.string,
    onError: _propTypes2.default.func,
    errorPageKey: _propTypes2.default.string,
    onRef: _propTypes2.default.func,
    onChangePage: _propTypes2.default.func,
    beforChangePage: _propTypes2.default.func,
    beforBack: _propTypes2.default.func,
    beforExit: _propTypes2.default.func,
    key: _propTypes2.default.string,
    height: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number])
  };
}

function addChildPropTypes(Component) {
  Component.propTypes = {
    key: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number]).isRequired,
    levelPage: _propTypes2.default.number.isRequired,
    backgroundColor: _propTypes2.default.string,
    height: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number]),
    backOnSwipeRight: _propTypes2.default.bool,
    transitionIn: _propTypes2.default.string,
    transitionOut: _propTypes2.default.string,
    animationTimeInMS: _propTypes2.default.number,
    props: _propTypes2.default.object,
    kill: _propTypes2.default.bool,
    alwaysLive: _propTypes2.default.bool
  };
}