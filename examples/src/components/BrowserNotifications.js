import React from 'react';

/**
 * Drop-in stand-in for the abandoned `react-browser-notifications` package,
 * which declared webpack 2 as a *runtime* dependency and dragged a large
 * vulnerable tree into this example. Same props and instance API, implemented
 * directly on the Notification web API.
 *
 * Props: title (required), body, icon, timeout, onClick, onRef
 * Instance API: supported(), show()
 */
export default class BrowserNotifications extends React.Component {

    componentDidMount() {
        if (this.props.onRef) this.props.onRef(this);
    }

    componentWillUnmount() {
        this.close();
        if (this.props.onRef) this.props.onRef(undefined);
    }

    supported() {
        return typeof window !== 'undefined' && 'Notification' in window;
    }

    show() {
        if (!this.supported()) return;

        if (window.Notification.permission === 'granted') {
            this.display();
            return;
        }

        if (window.Notification.permission !== 'denied')
            Promise.resolve(window.Notification.requestPermission()).then((permission) => {
                if (permission === 'granted') this.display();
            });
    }

    display() {
        const { title, body, icon, timeout, onClick } = this.props;

        this.close();

        this.notification = new window.Notification(title, { body, icon });
        if (onClick) this.notification.onclick = onClick;

        const ms = parseInt(timeout, 10);
        if (ms > 0) this.timer = setTimeout(() => this.close(), ms);
    }

    close() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = undefined;
        }
        if (this.notification) {
            this.notification.close();
            this.notification = undefined;
        }
    }

    render() {
        return null;
    }
}
