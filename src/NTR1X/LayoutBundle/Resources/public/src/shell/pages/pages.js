(function($,Vue, undefined) {

    Vue.component('shell-pages', {
        template: '#shell-pages',
        props: {
            pages: Array,
            selection: Object
        },
    });

})(jQuery, Vue);
