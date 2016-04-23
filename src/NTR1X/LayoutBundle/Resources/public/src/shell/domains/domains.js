(function($,Vue, undefined) {

    Vue.component('shell-domains', {
        template: '#shell-domains',
        props: {
            domains: Array,
            selected: Object
        },
        methods: {
            selectDomain: function(domain) {
                this.selected = domain;
            }
        }
    });

})(jQuery, Vue);
