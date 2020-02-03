
browserInterop = {
    eventListenersId: 0,
    eventListeners: {},
    getProperty: function (propertyName) {
        var splitProperty = propertyName.split('.');
        var currentProperty = window;
        for (i = 0; i < splitProperty.length; i++) {
            if (splitProperty[i] in currentProperty) {
                currentProperty = currentProperty[splitProperty[i]];
            } else {
                return null;
            }
        }
        return currentProperty;
    },
    addEventListener: function (propertyPath, eventName, dotnetAction) {
        var target = browserInterop.getProperty(propertyPath);
        var methodRef = function () {
            return dotnetAction.invokeMethodAsync('Invoke');
        }
        target.addEventListener(eventName, methodRef);
        var eventId = browserInterop.eventListenersId++;
        browserInterop.eventListeners[eventId] = methodRef;
        return eventId;
    },
    removeEventListener: function (propertyPath, eventName, eventListenersId) {
        var target = browserInterop.getProperty(propertyPath);
        target.removeEventListener(eventName, browserInterop.eventListeners[eventListenersId]);
    },
    hasProperty: function (propertyPath) {
        return browserInterop.getProperty(propertyPath) !== null;
    },
    getSerializableObject: function (data, alreadySerialized) {
        if (!alreadySerialized) {
            alreadySerialized = [];
        }
        var res = {};
        for (var i in data) {
            var currentMember = data[i];

            if (typeof currentMember === 'function' || currentMember === null) {
                continue;
            } else if (typeof currentMember === 'object') {
                if (alreadySerialized.indexOf(currentMember) < 0) {
                    alreadySerialized.push(currentMember);
                    if (Array.isArray(currentMember) || currentMember.length) {
                        res[i] = [];
                        for (var j = 0; j < currentMember.length; j++) {
                            const arrayItem = currentMember[j];
                            if (typeof arrayItem === 'object') {
                                res[i].push(browserInterop.getSerializableObject(arrayItem, alreadySerialized));
                            } else {
                                res[i].push(arrayItem);
                            }
                        }
                    } else {
                        //the browser provides some member (like plugins) as hash with index as key, if length == 0 we shall not convert it
                        if (currentMember.length === 0) {
                            res[i] = [];
                        } else {
                            res[i] = browserInterop.getSerializableObject(currentMember, alreadySerialized);
                        }
                    }
                }

            } else {
                // string, number or boolean
                if (currentMember === Infinity) { //inifity is not serialized by JSON.stringify
                    currentMember = "Infinity";
                }
                if (currentMember !== null) { //needed because the default json serializer in jsinterop serialize null values
                    res[i] = currentMember;
                }
            }
        }
        return res;
    },
    getAsJson: function (propertyName) {

        var data = browserInterop.getProperty(propertyName);
        var res = browserInterop.getSerializableObject(data);
        return res;
    },
    navigator: {
        geolocation: {
            getCurrentPosition: function (options) {
                return new Promise(function (resolve) {
                    navigator.geolocation.getCurrentPosition(
                        position => resolve({ location: browserInterop.getSerializableObject(position) }),
                        error => resolve({ error: browserInterop.getSerializableObject(error) }),
                        options)
                });
            },
            watchPosition: function (options, wrapper) {
                return navigator.geolocation.watchPosition(
                    position => {
                        const result = { location: browserInterop.getSerializableObject(position) };
                        console.log(result);
                        return wrapper.invokeMethodAsync('Invoke', result);
                    },
                    error => wrapper.invokeMethodAsync('Invoke', { error: browserInterop.getSerializableObject(error) }),
                    options
                );
            }
        },
        getBattery: function () {
            return new Promise(function (resolve, reject) {
                if (navigator.battery) {//some browser does not implement getBattery but battery instead see https://developer.mozilla.org/en-US/docs/Web/API/Navigator/battery
                    var res = browserInterop.getSerializableObject(navigator.battery);
                    resolve(res);
                    return;
                }
                navigator.getBattery().then(
                    function (battery) {
                        var res = browserInterop.getSerializableObject(battery);
                        resolve(res);
                    }
                );
            });
        }
    }
}