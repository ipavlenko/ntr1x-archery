(function($,Vue, undefined) {

    Vue.component('shell-sources', {
        template: '#shell-sources',
        props: {
            sources: Array,
            selection: Object
        },
    });

})(jQuery, Vue);
