(function($,Vue, undefined) {

    Vue.component('shell-page', {
        template: '#shell-page',
        props: {
            globals: Object,
            settings: Object,
            page: Object,
        },
    });

})(jQuery, Vue);
