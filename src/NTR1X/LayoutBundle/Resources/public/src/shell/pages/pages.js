(function($,Vue, undefined) {

    Vue.component('shell-pages', {
        template: '#shell-pages',
        props: {
            pages: Array,
            selected: Object
        },
        methods: {
            selectPage: function(page) {
                this.selected = page;
            }
        }
    });

})(jQuery, Vue);
