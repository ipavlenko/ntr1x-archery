

(function($, Vue, Core, undefined) {

    Vue.component('shell-page', {
        template: '#shell-page',
        mixins: [ /*Core.ContainerMixin, Core.SortableMixin*/ ],
        props: {
            globals: Object,
            settings: Object,
            page: Object,
        },
        data: function() {
            return {
                decorator: this.decorator,
            };
        },
        ready: function() {
            this.decorator = 'shell-decorator-canvas';
        },
    });

})(jQuery, Vue, Core);
