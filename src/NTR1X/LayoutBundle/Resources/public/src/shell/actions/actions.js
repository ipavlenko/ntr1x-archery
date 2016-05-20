(function($,Vue, undefined) {

    var scale = 1;

    Vue.component('shell-actions', {
        template: '#shell-actions',
        props: {
            model: Object,
            category: Object,
            domain: Object,
            page: Object
        },
        methods: {
            trigger: function(event, item, context) {
                this.$dispatch(event, { item: item, context: context });
            },
            zoom: function(event) {
                scale += (event == 'in') ? 0.1 : -0.1;
                $('.ge.ge-page').css('transform', 'scale(' + scale + ')');
            },
        }
    });

})(jQuery, Vue);
