let placeholder = "available";
let resultTimeout = 8000;
let resultCycleTime = 300;
let callCycleTime = 1000;
let debugLF = false;

//Register a function by its name, itself (callback) and the needed time span for the check cycle
function RegisterLocalStorageFunction(name, callback) {
    console.log("Registered function " + name);

    //Set local storage items for function and its result
    resetFunction(name);

    let i = 0;
    //Setting the cycle
    setInterval(function () {
        //Getting the params or eventually just the placeholder
        var params = localStorage.getItem(name);

        if(debugLF){
            console.log("Cycle" + i + " with param " + params);
            i++;
        }
        //Call the function if params are set and reset all
        if (params != placeholder) {
            var result = callback(params);
            //Set result
            localStorage.setItem(name + "Result", result);
            //Reset call
            localStorage.setItem(name, placeholder);
        }
    }, callCycleTime);
}

function CallLocalStorageFunction(name, params, callback) {
    if(debugLF)
        console.log("Called remote function " + name + "with params: " + params);
    //Check if the function is already called
    if (localStorage.getItem(name) == placeholder && localStorage.getItem(name + "Result") == placeholder) {
        console.log("Calling")

        //Call remote function
        localStorage.setItem(name, params);

        //Define timeout for later usage
        var timeout;
        let i = 0;

        //Check in interval for result
        var checkInterval = setInterval(function () {
            //Get it
            var result = localStorage.getItem(name + "Result");

            if(debugLF){
                console.log("Cycle" + i + " with result " + result);
                i++;
            }
            //Check wheter the result is set
            if (result != placeholder) {
                //Call callback with results
                callback(result);

                //Reset result in local storage
                localStorage.setItem(name + "Result", placeholder);

                //Dismiss interval and timeout
                clearTimeout(timeout);
                clearInterval(checkInterval);
            }
        }, resultCycleTime);

        //Start timout to cancel checkInterval if no result is set, hence no remote function was called
        timeout = setTimeout(function () {
            //Dismiss interval
            clearInterval(checkInterval);
            //Clean up
            resetFunction(name);
        }, resultTimeout);
    }
}

//Reset local storage values
function resetFunction(name) {
    localStorage.setItem(name, placeholder);
    localStorage.setItem(name + "Result", placeholder);
}
