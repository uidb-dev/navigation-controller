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
    key: PropTypes.string,
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  };
}

export function addChildPropTypes(Component) {
  Component.propTypes = {
    key:PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    levelPage: PropTypes.number.isRequired,
    backgroundColor: PropTypes.string,
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    backOnSwipeRight: PropTypes.bool,
    transitionIn: PropTypes.string,
    transitionOut: PropTypes.string,
    animationTimeInMS: PropTypes.number,
    props: PropTypes.object,
    kill: PropTypes.bool,
    alwaysLive: PropTypes.bool,
  };
}
