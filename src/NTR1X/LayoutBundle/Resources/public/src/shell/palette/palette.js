(function($,Vue, undefined) {

    var PaletteItem =
    Vue.component('shell-palette-item', {
        template: '#shell-palette-item',
        props: {
            widget: Object,
            globals: Object,
        },
        computed: {
            thumbnail: function() {
                return '/bundles/' + this.widget.provider.alias + '/' + this.widget.thumbnail.path;
            }
        },
        ready: function() {
            Sortable.create(this.$el, {
                group: {
                    name: 'widgets',
                    pull: 'clone',
                    put: false
                },
                animation: 150,
                sort: false,
            });
        }
    });

    Vue.component('shell-palette', {
        template: '#shell-palette',
        props: {
            globals: Object,
            category: Object,
            categories: Array,
        },
        components: {
            'palette-item': PaletteItem
        },
        methods: {
            trigger: function(event, item, context) {
                console.log(event, item, context);
                this.$dispatch(event, { item: item, context: context });
            },
        },
    });

})(jQuery, Vue);
