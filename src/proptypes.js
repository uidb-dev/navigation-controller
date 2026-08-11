import PropTypes from "prop-types";

export function addNavigatorPropTypes(Component) {
  Component.propTypes = {
    mobileMode: PropTypes.bool,
    homePageKey: PropTypes.string,
    changeRoute: PropTypes.bool,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.element),
      PropTypes.element,
    ]).isRequired,
    routeKey: PropTypes.string,
    onError: PropTypes.func,
    errorPageKey: PropTypes.string,
    onRef: PropTypes.func,
    onChangePage: PropTypes.func,
    beforChangePage: PropTypes.func,
    beforBack: PropTypes.func,
    beforExit: PropTypes.func,
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    animationTimeInMS: PropTypes.number,
  };
}

// NOTE: there used to be an `addChildPropTypes(Component)` export here. It was
// never called, and it could not work as written: React strips `key` from
// props, so `key: ...isRequired` would have warned on every single page, and
// `levelPage: ...isRequired` would have warned for every page that relies on
// the documented default. Child page props are documented in index.d.ts
// instead. See index.d.ts -> NavigatorPageProps.
