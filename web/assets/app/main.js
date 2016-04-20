requirejs.config({
    baseUrl: "js/lib",
    paths: {
        "app": "/assets/app",
        "jquery": "/assets/vendor/jquery/dist/jquery.min",
        "bootstrap": "/assets/vendor/bootstrap/dist/js/bootstrap.min",
        "bootstrap.datepicker": "/assets/vendor/bootstrap-datepicker/dist/js/bootstrap-datepicker.min",
        "bootstrap.tagsinput": "/assets/vendor/bootstrap-tagsinput/dist/bootstrap-tagsinput.min",
        "ckeditor": "/assets/vendor/ckeditor/ckeditor.js",
        "text": "/assets/vendor/text/text",
        "vue": "/assets/vendor/vue/dist/vue.min",
        "bundles": "/bundles",
    },
    shim: {
        "bootstrap": [ "jquery" ],
        "bootstrap.datepicker": [ "jquery", "bootstrap" ],
        "bootstrap.tagsinput": [ "jquery", "bootstrap" ],
    },
    urlArgs: "bust=" + (new Date()).getTime()
});

requirejs(["app/app"]);
