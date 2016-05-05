Core = window.Core || {};

(function($, Vue, Core) {


    Vue.component('default-form', {
        template: '#default-form',
        mixins: [ Core.WidgetMixin ]
    });

})(jQuery, Vue, Core);
