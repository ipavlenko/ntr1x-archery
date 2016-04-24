(function($,Vue, undefined) {

    Vue.component('shell-categories', {
        template: '#shell-categories',
        props: {
            categories: Array,
            selection: Object,
        },
        methods: {
            selectCategory: function(category) {
                this.selection = category;
            }
        }
    });

})(jQuery, Vue);
