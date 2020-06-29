using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.JSInterop;

namespace BrowserInterop
{
    /// <summary>
    /// This class enables using a C# action as a js callback function (like in event handling)
    /// </summary>
    public class CallBackInteropWrapper
    {
        [JsonPropertyName("__isCallBackWrapper")]
        public string IsCallBackWrapper { get; set; } = "";
        public Object SerializationSpec { get; set; }

        public bool GetJsObjectRef { get; set; }


        private CallBackInteropWrapper()
        {
 
        }

        /// <summary>
        /// Create js interop xrapper for this c# action.static 
        /// </summary>
        /// <param name="callback"></param>
        /// <param name="getDeepObject">If true then the event payload are serialized deeply, if no it's only shallow (mandatory when there is a window object)</param>
        /// <param name="getJsObjectRef">If true then only the js object ref to the payload is returned instead of the serialize js object</returns>
        public static CallBackInteropWrapper Create<T>(Func<T, Task> callback, Object serializationSpec = null, bool getJsObjectRef = false)
        {
            var res = new CallBackInteropWrapper
            {
                CallbackRef = DotNetObjectReference.Create(new JSInteropActionWrapper<T>(callback)),
                SerializationSpec  = serializationSpec,
                GetJsObjectRef = getJsObjectRef
            };
            return res;
        }

        /// <summary>
        /// Create js interop xrapper for this c# action.static 
        /// </summary>
        /// <param name="callback"></param>
        /// <param name="getDeepObject">If true then the event payload are serialized deeply, if no it's only shallow (mandatory when there is a window object)</param>
        /// <returns>Object that needs to be send to js interop api call</returns>
        public static CallBackInteropWrapper Create(Func<Task> callback, Object serializationSpec = null, bool getJsObjectRef = false)
        {
            var res = new CallBackInteropWrapper
            {
                CallbackRef = DotNetObjectReference.Create(new JSInteropActionWrapper(callback)),
                SerializationSpec = serializationSpec,
                GetJsObjectRef = getJsObjectRef
            };
            return res;
        }

        public object CallbackRef { get; set; }
    }

}
