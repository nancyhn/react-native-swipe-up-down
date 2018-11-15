import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  PanResponder,
  Dimensions,
  LayoutAnimation,
  TouchableOpacity
} from 'react-native';
import PropTypes from 'prop-types';
import SwipeIcon from './components/SwipeIcon';
import images from './assets/images';
import sz from '../../../src/constants/Layout'
import { getStatusBarHeight } from 'react-native-status-bar-height';
const statusH = Platform.OS === 'ios' ? getStatusBarHeight() : 0

const MARGIN_TOP = Platform.OS === 'ios' ? 44 : 0;
const DEVICE_HEIGHT = Dimensions.get('window').height - MARGIN_TOP - 50 - 50;

export default class SwipeUpDown extends Component {
  static defautProps = {
    disablePressToShow: false,
    tabbarHeight: 50,
  };
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false
      
    };
    this.disablePressToShow = props.disablePressToShow;
    this.SWIPE_HEIGHT = props.swipeHeight || 250
    this._panResponder = null;
    this.height = this.SWIPE_HEIGHT;
    this.customStyle = {
      style: {
        bottom: 0,
        height: this.height
      }
    };
    this.checkCollapsed = true;
    this.showFull = this.showFull.bind(this);
  }

  componentWillMount() {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e, gestureState) => true,
      onPanResponderEnd: (e, gestureState) => true,
      onMoveShouldSetPanResponder: (event, gestureState) => true,
      onPanResponderMove: this._onPanResponderMove.bind(this),
      onPanResponderRelease: this._onPanResponderRelease.bind(this)
    });
  }

  componentDidMount() {
    this.props.hasRef && this.props.hasRef(this);
  }

  updateNativeProps() {
    switch (this.props.animation) {
      case 'linear':
        LayoutAnimation.linear();
        break;
      case 'spring':
        LayoutAnimation.spring();
        break;
      case 'easeInEaseOut':
        LayoutAnimation.easeInEaseOut();
        break;
      case 'none':
      default:
        break;
    }
    this.viewRef.setNativeProps(this.customStyle);
  }

  _onPanResponderMove(event, gestureState) {
    if (gestureState.dy > 0 && !this.checkCollapsed) {
      // SWIPE DOWN

      this.customStyle.style.height = DEVICE_HEIGHT - gestureState.dy;
      this.swipeIconRef && this.swipeIconRef.setState({ icon: images.minus });
      !this.state.collapsed && this.setState({ collapsed: false });
      this.updateNativeProps();
    } else if (this.checkCollapsed && gestureState.dy < -60) {
      // SWIPE UP
      // this.top = 0;
      // this.customStyle.style.top = DEVICE_HEIGHT + gestureState.dy;
      this.customStyle.style.height = -gestureState.dy + this.SWIPE_HEIGHT;
      this.swipeIconRef &&
        this.swipeIconRef.setState({ icon: images.minus, showIcon: true });
        this.swipeIconRef &&
        this.swipeIconRef.setState({
          icon: images.arrow_down,
          showIcon: true
        });
      this.updateNativeProps();
      this.state.collapsed && this.setState({ collapsed: false });
    }
  }

  _onPanResponderRelease(event, gestureState) {
    if (gestureState.dy < -50 || gestureState.dy < 50) {
      this.showFull();
    } else {
      if (this.checkCollapsed === false) {
        this.showMini();
      }
      else {
        this.showMinimize()
      }
    }
  }

  showFull() {
    const { onShowFull } = this.props;
    this.customStyle.style.height = DEVICE_HEIGHT;
    this.swipeIconRef &&
      this.swipeIconRef.setState({ icon: images.arrow_down, showIcon: true });
    this.updateNativeProps();
    this.state.collapsed && this.setState({ collapsed: false });
    this.checkCollapsed = false;
    onShowFull && onShowFull();
  }

  showMini() {
    const { onShowMini, itemMini } = this.props;
    this.customStyle.style.height = itemMini ? this.SWIPE_HEIGHT : 0;
    this.swipeIconRef && this.swipeIconRef.setState({ icon: images.minus, showIcon: true });
    this.updateNativeProps();
    !this.state.collapsed && this.setState({ collapsed: false });
    this.checkCollapsed = true;
    onShowMini && onShowMini();
  }
  showMinimize() {
    const { onShowMini, itemMini } = this.props;
    this.customStyle.style.height = 20;
    this.swipeIconRef && this.swipeIconRef.setState({ icon: images.minus, showIcon: true });
    this.updateNativeProps();
    !this.state.collapsed && this.setState({ collapsed: false });
    this.checkCollapsed = true;
    onShowMini && onShowMini();
  }

  render() {
    const { itemMini, itemFull, style } = this.props;
    const { collapsed } = this.state;
    return (
      <View
        ref={ref => (this.viewRef = ref)}
        style={[
          styles.wrapSwipe,
          {
            height: this.SWIPE_HEIGHT,
            marginTop: sz.statusHeight
          },
          style
        ]}
      >
        <SwipeIcon
          onClose={() => this.showMini()}
          hasRef={ref => (this.swipeIconRef = ref)}
        />

        {collapsed ?  (this.state.mini === true ? itemMini: itemFull) : itemFull }
        <View {...this._panResponder.panHandlers} style={{ width: Dimensions.get('window').width - 80, height: 100, backgroundColor: 'transparent', position: 'absolute' }}/>

      </View>
    );
  }
}
SwipeUpDown.propTypes = {
  hasRef: PropTypes.func,
  swipeHeight: PropTypes.number,
  itemMini: PropTypes.object,
  itemFull: PropTypes.object,
  disablePressToShow: PropTypes.bool,
  style: PropTypes.object,
  onShowMini: PropTypes.func,
  onShowFull: PropTypes.func,
  animation: PropTypes.string
};
const styles = StyleSheet.create({
  wrapSwipe: {
    padding: 10,
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  }
});
