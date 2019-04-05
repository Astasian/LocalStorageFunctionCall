/*
The MIT License (MIT)
Copyright (c) 2016 Astasian
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
https://github.com/Astasian/LocalStorageFunctionCall
*/
class LocalStorageCommunicator {

    private TIMEOUT: number = 100;

    public registerFunction<T>(functionName: string, func: (...params: any) => T): void {

        //Cleanup first
        this.resetFunction(functionName);
        this.resetResult(functionName);

        //Setting the event
        window.addEventListener('storage', (event: StorageEvent) => {
            //Getting the params or eventually just the placeholder

            //Call the function if params are set and reset all
            if (event.key === functionName) {
                const params = this.parseNullableString(event.newValue);
                const result = func(params);

                this.setResult(functionName, result);
                this.resetFunction(functionName);
            }
        });
    }

    public callFunction<T>(functionName: string, ...params: any): Promise<T> {
        return new Promise<T>((resolve, reject) => {

            //Check if the function is already called
            if (localStorage.getItem(functionName) !== null ||
                localStorage.getItem(functionName + "Result") !== null) {
                reject();
            }

            //Call remote function
            localStorage.setItem(functionName, JSON.stringify(params));

            //Define timeout and event for future usage
            let timeout: number;

            //Check in interval for result
            const storageEvent = (event: StorageEvent) => {
                //Check whether the result is set
                if (event.key == functionName + "Result" && event.oldValue === null) {
                    try {
                        //Call callback with results
                        const result = this.parseNullableString<T>(event.newValue);
                        resolve(result);
                    }
                    finally {
                        //Dismiss listener and timeout
                        // todo maybe check, if its set
                        clearTimeout(timeout);
                        window.removeEventListener('storage', storageEvent);
                        //Reset result in local storage
                        this.resetResult(functionName);
                    }
                }
            }

            //Add event listener
            window.addEventListener('storage', storageEvent);

            //Start timout to cancel listener if no result is set, hence no remote function was called
            timeout = setTimeout(() => {
                //Dismiss interval
                clearTimeout(timeout);
                //Clean up
                localStorage.removeItem(name);
                window.removeEventListener('storage', storageEvent);
            }, this.TIMEOUT);
        });
    }

    private resetResult(functionName: string): void {
        localStorage.removeItem(functionName + "Result");
    }

    private resetFunction(functionName: string){
        localStorage.removeItem(functionName);
    }

    private setResult<T>(functionName: string, result: T) {
        localStorage.setItem(functionName + "Result", JSON.stringify(result));
    }

    private parseNullableString<T>(str: string | null): T {
        return str === null ? null : JSON.parse(str);
    }
}