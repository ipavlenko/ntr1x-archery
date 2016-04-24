(function($,Vue, undefined) {

    Vue.component('shell-sources', {
        template: '#shell-sources',
        props: {
            sources: Array,
            selected: Object
        },
        methods: {
            selectSource: function(source) {
                this.selected = source;
            }
        }
    });

})(jQuery, Vue);
