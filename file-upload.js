(function ( $ ) {
    var uploaders = [];
    
    $.fn.fileUpload = function( options, value ) {
        var _this = this;
        if ( ! $(this).hasClass("file-upload-jq") ) {
            var uploader = new Uploader(this, options);
            uploaders.push(uploader);
        } else {
            var uploaderIndex = null;
            $(uploaders).each(function(index) {
                if (this.id === $(_this).attr("id")) {
                    uploaderIndex = index;
                }
            });
            
            switch (options) {
                case "url" : 
                    return uploaders[uploaderIndex].url(value);
                    break;
                case "onSuccess"   : 
                    return uploaders[uploaderIndex].onSuccess(value);
                    break;
                case "onError" : 
                    return uploaders[uploaderIndex].onError(value);
                    break;
                case "before" : 
                    return uploaders[uploaderIndex].before(value);
                    break;
                case "after" : 
                    return uploaders[uploaderIndex].after(value);
                    break;
                case "responseType" : 
                    return uploaders[uploaderIndex].responseType(value);
                    break;
                case "container" : 
                    return uploaders[uploaderIndex].container(value);
                    break;
                case "input" : 
                    return uploaders[uploaderIndex].input(value);
                    break;
                case "uploadOn" : 
                    return uploaders[uploaderIndex].uploadOn(value);
                    break;
                case "inputName" :
                    return uploaders[uploaderIndex].inputName(value);
                    break;
                case "additionalData" :
                    return uploaders[uploaderIndex].additionalData(value);
                case "remove" :
                    $(this).removeClass("file-upload-jq");
                    uploaders.splice(uploaderIndex, 1);
                    break;
                case "progress":
                    return uploaders[uploaderIndex].progress;
                    break;
                case "allowedFileTypes":
                    return uploaders[uploaderIndex].allowedFileTypes(value);
                    break;
                case "onFileChange":
                    return uploaders[uploaderIndex].onFileChange(value);
                    break;
                default: console.log("Oh! What do we have here? It looks strange. Have a look at it: ", options);
            }
            
        }
        
        function Uploader (element, options) 
        {
            var $this           = this;
            var waitForFiles    = false;
            var files           = [];
            var filesCheckInterval;
            
            $this.progress = 0;
            
            var settings = $.extend({
                url:            "/upload.php",
                onSuccess:      function(response){
                                    console.log("Upload successful");
                                },
                onError:        function(response){
                                    console.log("Upload failed");
                                },
                before:         function () {},
                beforeAjaxSend: function () {},
                onProgress:     function () {},
                after:          function () {},
                onFileChange:   function () {},
                responseType:   "json",            
                container:      $(element).parent(),
                input:          element.selector,
                // Default inputName will be the name of the input html tag used. If used for multiple files, provide an array like "files[]"
                inputName:      $(element.selector).attr("name"),
                additionalData: {},
                uploadOn:       {
                                    selector: element.selector, 
                                    clientEvent: "change"
                                },
                allowedFileTypes: [],
                error:          null
            }, options);
            
            $this.url = function(value) {
                console.log("Value: ", value);
                if (value) {
                    settings.url = value;
                } else {
                    return settings.url;
                }
            };
            
            $this.onSuccess = function (value) {
                if (value) {
                    settings.onSuccess = value;
                } else {
                    settings.onSuccess();
                }
            };
            
            $this.onError = function (value) {
                if (value) {
                    settings.onError = value;
                } else {
                    return settings.onError();
                }
            };
            
            $this.before = function (value) {
                if (value) {
                    settings.before = value;
                } else {
                    return settings.before;
                }
            };
            
            $this.after = function (value) {
                if (value) {
                    settings.after = value;
                } else {
                    settings.after;
                }
            };
            
            $this.responseType = function (value) {
                if (value) {
                    settings.responseType = value;
                } else {
                    return settings.responseType;
                }
            };
            
            $this.container = function (value) {
                if (value) {
                    settings.container = value;
                } else {
                    return settings.container;
                }
            };
            
            $this.input = function (value) {
                if (value) {
                    settings.input = value;
                } else {
                    return settings.input;
                }
            };
            
            $this.onUpload = function (value) {
                if (value) {
                    settings.onUpload = value;
                } else {
                    return settings.onUpload;
                }
            };
            $this.inputName = function (value) {
                if (value) {
                    settings.inputName = value;
                } else {
                    return settings.inputName;
                }
            };
            $this.additionalData = function (value) {
                if (value) {
                    settings.additionalData = value;
                } else {
                    return settings.additionalData;
                }
            };
            
            $this.id = function(){
                return this.id;
            };
            
            $this.allowedFileTypes = function(value) {
                if (value) {
                    settings.allowedFileTypes = value;
                } else {
                    return settings.allowedFileTypes;
                }
            };
            
            
            $(settings.container).on("change", settings.input, function(event){
                waitForFiles = true;
                if (!settings.inputName) {
                    settings.inputName = $(event.target).attr("name");
                }
                if (settings.inputName != null) {
                    $ (event.target.files).each(function(index, value) {
                        files.push({data: value, name: settings.inputName});
                    });
                }
                if (files.length) {
                    waitForFiles = false;
                }
                settings.onFileChange(event.target.files[0], settings);
                if (settings.error) {
                    settings.onError(settings.error);
                }
            });
            
            $(settings.container).on(settings.uploadOn.clientEvent, settings.uploadOn.selector, function(event) {
                settings.before($this, event);
                filesCheckInterval = setInterval(function() {
                    var formData = new FormData();
                    settings.error = null;
                    if (!waitForFiles) {
                        clearInterval(filesCheckInterval);
                        $(files).each(function(index, value){
                            if (! value.name ) {
                                value.name = settings.inputName;
                            } 
                            console.log("[FILE NAME]: ", value.name);
                            settings.current_file = value.data;
                            
                            if (settings.allowedFileTypes.length) {
                                if (settings.allowedFileTypes.indexOf(value.data.type) > -1) {
                                    formData.append(value.name, value.data);
                                    settings.error = null;
                                } else {
                                    settings.error = "Forkert filformat: '" + value.data.type + "'";
                                }
                            } else {
                                formData.append(value.name, value.data);
                                console.log("File type", value.data.type);
                            }
                        });
                        
                        if (!settings.error) {
                            //start of ajax request
                            $.ajax({
                                url:            settings.url,
                                xhr:            function(){
                                                    // get the native XmlHttpRequest object
                                                    var xhr = $.ajaxSettings.xhr() ;
                                                    // set the onprogress event handler
                                                    xhr.upload.onprogress = function (event) {
                                                        if (event.lengthComputable) {  
                                                            $this.progress = (event.loaded / event.total) * 100;
                                                            settings.onProgress($this.progress);
                                                        }
                                                    };
                                                    // return the customized object
                                                    return xhr ;
                                                },
                                xhrFields:      {
                                                    withCredentials: true
                                                },
                                type:           "POST",
                                data:           formData,
                                cache:          true,
                                dataType:       settings.responseType,
                                processData:    false,
                                contentType:    false,
                                beforeSend:     function(XMLHttpRequest, settingsObject) {
                                    settings.beforeAjaxSend(XMLHttpRequest, settings);
                                    
                                    if (settings.error) {
                                        XMLHttpRequest.abort();
                                        settings.onError(settings.error);
                                    } else {
                                        // In case sending additional data together with the file upload is necessary
                                        if (settings.additionalData) {
                                            for(var key in settings.additionalData) {
                                                formData.append(key, settings.additionalData[key]);
                                            }
                                        }
                                    }
                                },

                                success:        function(response, textStatus, jqXHR) {
                                    files = [];
                                    formData = new FormData();
                                    settings.onSuccess(response, textStatus, jqXHR);
                                },

                                error:      function(response, textStatus, jqXHR) {
                                    settings.onError(response, textStatus, jqXHR);
                                    console.log("Error:", response, textStatus, jqXHR);
                                },

                                complete:   function() {
                                    $(settings.input).val(null);
                                     settings.after();
                                }
                            });

                            //end of ajax request
                        } else {
                            console.log(settings.error);
                            settings.onError(settings.error);
                        }
                    }
                }, 300);
            });
            var uploaderIndex = 1 + uploaders.length;
            if ($(element).attr("id")) {
                this.id = $(element).attr("id");
            } else {
                this.id = "file-upload-jq-" + uploaderIndex;
                $(element).attr("id", this.id);
            }
            $(element).addClass("file-upload-jq");
        }

    };
}(jQuery));
