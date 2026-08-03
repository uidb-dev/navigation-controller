"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addChildPropTypes = addChildPropTypes;
exports.addNavigatorPropTypes = addNavigatorPropTypes;
var _propTypes = _interopRequireDefault(require("prop-types"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function addNavigatorPropTypes(Component) {
  Component.propTypes = {
    mobileMode: _propTypes.default.bool,
    homePageKey: _propTypes.default.string,
    changeRoute: _propTypes.default.bool,
    children: _propTypes.default.oneOfType([_propTypes.default.arrayOf(_propTypes.default.element), _propTypes.default.element]).isRequired,
    routeKey: _propTypes.default.string,
    onError: _propTypes.default.func,
    errorPageKey: _propTypes.default.string,
    onRef: _propTypes.default.func,
    onChangePage: _propTypes.default.func,
    beforChangePage: _propTypes.default.func,
    beforBack: _propTypes.default.func,
    beforExit: _propTypes.default.func,
    key: _propTypes.default.string,
    height: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.number])
  };
}
function addChildPropTypes(Component) {
  Component.propTypes = {
    key: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.number]).isRequired,
    levelPage: _propTypes.default.number.isRequired,
    backgroundColor: _propTypes.default.string,
    height: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.number]),
    backOnSwipeRight: _propTypes.default.bool,
    transitionIn: _propTypes.default.string,
    transitionOut: _propTypes.default.string,
    animationTimeInMS: _propTypes.default.number,
    props: _propTypes.default.object,
    kill: _propTypes.default.bool,
    alwaysLive: _propTypes.default.bool
  };
}