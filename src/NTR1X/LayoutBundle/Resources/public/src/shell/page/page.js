(function($,Vue, undefined) {

    Vue.component('shell-page', function(ready) {

        ready({
            template: '#shell-page',
            props: {
                globals: Object,
                settings: Object,
                page: Object,
            },
        })
    });

})(jQuery, Vue);
