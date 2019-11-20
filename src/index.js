
const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.1/8 is considered localhost for IPv4.
    window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

let cordovaScript_URL = "";

if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    //production
}
else {
    cordovaScript_URL = document.URL.slice(0, document.URL.lastIndexOf(":")) + ":8597/browser/www";
}

window.addEventListener('load', (e) => {


    var tag = document.createElement('script');
    tag.async = true;
    tag.src = `${cordovaScript_URL + process.env.PUBLIC_URL}/cordova.js`;

    e.currentTarget.document.body.appendChild(
        document.createComment("This is an automatic switching src according to the run method. Comes from cordova_script")
    );
    e.currentTarget.document.body.appendChild(tag);

});

