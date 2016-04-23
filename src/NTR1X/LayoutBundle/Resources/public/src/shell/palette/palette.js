(function($,Vue, undefined) {

    Vue.component('shell-palette', {
        template: '#shell-palette',
        props: {
            category: Object
        },
        methods: {
            thumbnail: function(widget) {
                return '/bundles/' + widget.provider.alias + '/' + widget.thumbnail.path;
            }
        }
    });

})(jQuery, Vue);
