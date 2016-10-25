# LocalStorageFunctionCall
Call a function via the localStorage and register callbacks between Tabs etc.

Register a function:
	RegisterLocalStorageFunction("test", function(param){
      return param+param;
    })
		
Call a function:
	let str = "testing";
	CallLocalStorageFunction("test",str,function(para){
		console.log(para);
		});
		
Keep in mind that localStorage just wants strings and no objects. Stringify them before.
