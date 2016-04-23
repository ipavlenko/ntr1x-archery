(function($,Vue, undefined) {

    Vue.component('shell-categories', {
        template: '#shell-categories',
        props: {
            categories: Array,
            selected: Object,
        },
        methods: {
            selectCategory: function(category) {
                this.selected = category;
            }
        }
    });

})(jQuery, Vue);
