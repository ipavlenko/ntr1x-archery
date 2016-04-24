(function($,Vue, undefined) {

    Vue.component('shell-domains', {
        template: '#shell-domains',
        props: {
            domains: Array,
            selection: Object
        },
    });

})(jQuery, Vue);
