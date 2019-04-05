"use strict";
Window["LocalStorageCommunicator"]  = (function () {
    function LocalStorageCommunicator() {
        this.TIMEOUT = 100;
    }
    LocalStorageCommunicator.prototype.registerFunction = function (functionName, func) {
        var _this = this;
        this.resetFunction(functionName);
        this.resetResult(functionName);
        window.addEventListener('storage', function (event) {
            if (event.key === functionName) {
                var params = _this.parseNullableString(event.newValue);
                var result = func(params);
                _this.setResult(functionName, result);
                _this.resetFunction(functionName);
            }
        });
    };
    LocalStorageCommunicator.prototype.callFunction = function (functionName) {
        var _this = this;
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        return new Promise(function (resolve, reject) {
            if (localStorage.getItem(functionName) !== null ||
                localStorage.getItem(functionName + "Result") !== null) {
                reject();
            }
            localStorage.setItem(functionName, JSON.stringify(params));
            var timeout;
            var storageEvent = function (event) {
                if (event.key == functionName + "Result" && event.oldValue === null) {
                    try {
                        var result = _this.parseNullableString(event.newValue);
                        resolve(result);
                    }
                    finally {
                        clearTimeout(timeout);
                        window.removeEventListener('storage', storageEvent);
                        _this.resetResult(functionName);
                    }
                }
            };
            window.addEventListener('storage', storageEvent);
            timeout = setTimeout(function () {
                clearTimeout(timeout);
                localStorage.removeItem(name);
                window.removeEventListener('storage', storageEvent);
            }, _this.TIMEOUT);
        });
    };
    LocalStorageCommunicator.prototype.resetResult = function (functionName) {
        localStorage.removeItem(functionName + "Result");
    };
    LocalStorageCommunicator.prototype.resetFunction = function (functionName) {
        localStorage.removeItem(functionName);
    };
    LocalStorageCommunicator.prototype.setResult = function (functionName, result) {
        localStorage.setItem(functionName + "Result", JSON.stringify(result));
    };
    LocalStorageCommunicator.prototype.parseNullableString = function (str) {
        return str === null ? null : JSON.parse(str);
    };
    return LocalStorageCommunicator;
}());
