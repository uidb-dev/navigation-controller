"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
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
    height: _propTypes.default.oneOfType([_propTypes.default.string, _propTypes.default.number]),
    animationTimeInMS: _propTypes.default.number
  };
}

// NOTE: there used to be an `addChildPropTypes(Component)` export here. It was
// never called, and it could not work as written: React strips `key` from
// props, so `key: ...isRequired` would have warned on every single page, and
// `levelPage: ...isRequired` would have warned for every page that relies on
// the documented default. Child page props are documented in index.d.ts
// instead. See index.d.ts -> NavigatorPageProps.