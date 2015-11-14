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
                default: console.log("Oh! What do we have here? It looks strange. Have a look at it: ", options);
            }
            
        }
        
        function Uploader (element, options) 
        {
            var $this = this;
            
            var files = [];
            var filesCheckInterval;
            var settings = $.extend({
                url:            "/upload.php",
                onSuccess:      function(response){
                                    console.log("Upload successful");
                                },
                onError:        function(response){
                                    console.log("Upload failed");
                                },
                before:         function ($this) {},
                beforeAjaxSend: function () {},
                after:          function () {},
                responseType:   "json",            
                container:      $(element).parent(),
                input:          "input[type=file]",
                // Default inputName will be the name of the input html tag used. If used for multiple files, provide an array like "files[]"
                inputName:      null,
                additionalData: {},
                uploadOn:       {
                                    selector: "#file-upload", 
                                    clientEvent: "click"
                                }
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
                    settings.onSuccess;
                }
            };
            
            $this.onError = function (value) {
                if (value) {
                    settings.onError = value;
                } else {
                    return settings.onError;
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
            
            $(settings.container).on("change", $(settings.input), function(event){
                var input_name = $(event.target).attr("name");
                $ (event.target.files).each(function(index, value) {
                    files.push({data: value, name: input_name});
                });          
            });
            
            $(settings.container).on(settings.uploadOn.clientEvent, settings.uploadOn.selector, function(event) {
                settings.before($this);
                filesCheckInterval = setInterval(function() {
                    if (files.length) {
                        clearInterval(filesCheckInterval);
                        var filesData = new FormData();
                        
                        $(files).each(function(index, value){
                            if (! value.name) {
                                value.name = settings.inputName;
                            }
                            filesData.append(value.name, value.data);
                        });
                        
                        // In case sending additional data together with the file upload is necessary. Additional data must be a JSON object
                        
                        if (settings.additionalData) {
                            for(var key in settings.additionalData) {
                                filesData.append(key, settings.additionalData[key]);
                            }
                        }
                        //start of ajax request

                        $.ajax({
                            url:            settings.url,
                            type:           "POST",
                            data:           filesData,
                            cache:          false,
                            dataType:       settings.responseType,
                            processData:    false,
                            contentType:    false,
                            beforeSend:     settings.beforeAjaxSend,

                            success:        function(response, textStatus, jqXHR) {
                                settings.onSuccess(response, textStatus, jqXHR);
                            },

                            error:      function(response, textStatus, jqXHR) {
                                settings.onError(response, textStatus, jqXHR);
                            },

                            complete:   function() {
                                $(settings.input).val(null);
                                 settings.after();
                            }
                        });

                        //end of ajax request
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
