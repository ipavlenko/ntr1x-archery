(function(Vue, $, Core) {

    var ModalEditor =
    Vue.component('params-dialog', {
        template: '#params-dialog',
        mixins: [Core.ModalEditorMixin],
        methods: {
            setStrategy: function(strategy) {
                this.$set('current.param.strategy', strategy);
            }
        }
    });

    var Editor =
    Vue.component('params', {

        mixins: [Core.ActionMixin(ModalEditor)],
    });

})(Vue, jQuery, Core, undefined);
